const axios = require('axios')
const express = require('express')
const {v4: uuidv4} = require('uuid')
const app = express()
app.use(express.json())

/*
{
  1: [
    {
      lembretesId: 1,
      id: 1001,
      texto: 'Comprar abacate'
    },
  ]
}
*/
const observacoesPorlembretes = {}

const funcoes = {
  ObservacaoClassificada: async (observacao) => {
    const observacoes = observacoesPorlembretes[observacao.lembretesId]
    const obsParaAtualizar = observacoes.find( o => o.id === observacao.id)
    obsParaAtualizar.status = observacao.status
    obsParaAtualizar.apropriado = observacao.apropriado
    await axios.post('http://192.168.1.124:10000/eventos', {
      tipo: 'ObservacaoAtualizada',
      dados: observacao
    })

  }
}

//POST /lembretess/1/observacoes
//POST /lembretess/2/observacoes
app.post('/lembretes/:id/observacoes', (req, res) => {
  const idObs = uuidv4()
  const { texto } = req.body
  const observacoesDolembretes = observacoesPorlembretes[req.params.id] || []
  const observacao = {
    id: idObs,
    lembretesId: req.params.id,
    texto,
    status: 'aguardando',
    apropriado: 'aguardando'
  }
  observacoesDolembretes.push(observacao)
  //emitir um evento do tipo ObservacaoCriada, passando a observação associada ao campo dados
  axios.post('http://192.168.1.124:10000/eventos', {
    tipo: 'ObservacaoCriada',
    dados: observacao
  })
  observacoesPorlembretes[req.params.id] = observacoesDolembretes
  res.status(201).json(observacoesDolembretes)
})

//GET /lembretess/1/observacoes
//GET /lembretess/2/observacoes
app.get('/lembretes/:id/observacoes', function(req, res){
  res.json(observacoesPorlembretes[req.params.id] || [])
})


app.post('/eventos', async (req, res) => {
  try{
    const evento = req.body
    console.log(evento)
    funcoes[evento.tipo](evento.dados)
  }
  catch(e){}
  finally{
    res.end()
  }
})

const port = 5000
app.listen(port, () => {
  console.log(`Observações. Porta ${port}.`)
})
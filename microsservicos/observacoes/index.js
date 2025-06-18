const axios = require('axios')
const express = require('express')
const {v4: uuidv4} = require('uuid')
const app = express()
app.use(express.json())

/*
{
  1: [
    {
      lembreteId: 1,
      id: 1001,
      texto: 'Comprar abacate'
    },
  ]
}
*/
const observacoesPorLembrete = {}

const funcoes = {
  ObservacaoClassificada: async (observacao) => {
    const observacoes = observacoesPorLembrete[observacao.lembreteId]
    const obsParaAtualizar = observacoes.find( o => o.id === observacao.id)
    obsParaAtualizar.status = observacao.status
    obsParaAtualizar.apropriado = observacao.apropriado
    await axios.post('http://192.168.0.11:10000/eventos', {
      tipo: 'ObservacaoAtualizada',
      dados: observacao
    })

  }
}

//POST /lembretes/1/observacoes
//POST /lembretes/2/observacoes
app.post('/lembretes/:id/observacoes', (req, res) => {
  const idObs = uuidv4()
  const { texto, apropriado } = req.body
  const observacoesDoLembrete = observacoesPorLembrete[req.params.id] || []
  const observacao = {
    id: idObs,
    lembreteId: req.params.id,
    texto,
    status: 'aguardando',
    apropriado
  }
  observacoesDoLembrete.push(observacao)
  //emitir um evento do tipo ObservacaoCriada, passando a observação associada ao campo dados
  axios.post('http://192.168.0.11:10000/eventos', {
    tipo: 'ObservacaoCriada',
    dados: observacao
  })
  observacoesPorLembrete[req.params.id] = observacoesDoLembrete
  res.status(201).json(observacoesDoLembrete)
})

//GET /lembretes/1/observacoes
//GET /lembretes/2/observacoes
app.get('/lembretes/:id/observacoes', function(req, res){
  res.json(observacoesPorLembrete[req.params.id] || [])
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
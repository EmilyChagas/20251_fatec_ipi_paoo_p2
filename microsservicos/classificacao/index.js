const axios = require('axios')
const express = require('express')
const app = express()
app.use(express.json())
const palavraChave = 'importante'
const funcoes = {
  ObservacaoCriada: async (observacao) => {
    //1. Atualizar o status da observação
    //se o texto incluir a palavraChave, trocar o status para importante
    //caso contrário, trocar o status para comum
    console.log(observacao.status.includes(palavraChave))
    observacao.status = observacao.texto.includes(palavraChave) ? 'importante' : 'comum'
      console.log(observacao)
    //emitir um evento do tipo ObservacaoClassificada, direcionado ao barramentpo
    //use a observacao como "dados"
    //emita o evento com a axios
    await axios.post(
        'http://192.168.68.110:10000/eventos',{
          tipo: 'ObservacaoClassificada',
          dados: observacao
        }
    )
  },
  LembreteCriado: async (lembrete) => {
        lembrete.status = lembrete.texto.length <= 50 ? 'importante' : 'comum'
        await axios.post('http://192.168.68.110:10000/eventos', {
          tipo: 'LembreteClassificado',
          dados: lembrete
        }
      )
    }
}


app.post('/eventos', async (req, res) => {
  try{
    const evento = req.body
    console.log(evento)
    await funcoes[evento.tipo](evento.dados)
  }
  catch(e){}
  finally{
    res.end()
  }
})
const port = 7000
app.listen(port, () => console.log(`Classificação. Porta ${port}`))
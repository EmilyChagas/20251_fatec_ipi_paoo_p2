const axios = require('axios')
const express = require('express')
const app = express()
app.use(express.json())
let id = 0
const lembretes = {
}

//GET /lembretes () => {} (endpoint)
app.get('/lembretes', (req, res) => {
  res.json(lembretes)
})

//POST /lembretes () => {} (endpoint)
app.post('/lembretes', (req, res) => {
  id = id + 1
  //pegar o texto do corpo da requisição
  //a requisição é o objeto req
  //req tem uma propriedade chamada body
  //o body, por sua vez, é o objeto json enviado a partir da thunder
  // const texto = req.body.texto
  const { texto } = req.body
  lembretes[id] = {
    id,
    texto
  }
  axios.post('http://192.168.68.110:10000/eventos', {
    tipo: 'LembreteCriado',
    dados: {id, texto}
  })
  res.status(201).json(lembretes[id])
})

//definir o endpoint da figura
//ele deve exibir o evento e encerra o tratamento da requisição com res.end
app.post('/eventos', async (req, res) => {
  try{
    const evento = req.body
    console.log(evento)
  }
  catch(e){}
  finally{
    res.end()
  }
})

//localhost:porta
const port = 4000
app.listen(port, () => {
  console.log(`Lembretes. Porta ${port}.`)
})


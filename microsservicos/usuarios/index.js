const axios = require('axios')
const express = require('express')
const app = express()
app.use(express.json())

let id = 0
const usuarios = {}
app.get('/usuarios', (req, res) => {
  res.json(usuarios)
})

app.post('/usuarios', (req, res) => {
  id = id + 1
  const { nome, idade, endereco } = req.body
  usuarios[id] = {
    id,
    nome,
    idade,
    endereco
  }
  axios.post('http://192.168.1.124:10000/eventos', {
      tipo: 'UsuarioCriado',
      dados: {id, nome, idade, endereco}
    })
    res.status(201).json(usuarios[id])
})



app.post('/eventos', (req, res) => {
  console.log('Evento recebido:', req.body)
  res.end()
})

const port = 8000
app.listen(port, () => {
  console.log(`Usuários. Porta ${port}.`)
})

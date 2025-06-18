const axios = require('axios')
const express = require('express')
const app = express()
const {v4: uuidv4} = require('uuid')
app.use(express.json())

let id = 1
const usuarios = {}

app.post('/usuarios', (req, res) => {
  const { nome, idade, endereco } = req.body
  const novoUsuario = {
    id,
    nome,
    idade,
    endereco
  }
  usuarios[id] = novoUsuario
  id++
  res.status(201).json(novoUsuario)
})

app.get('/usuarios', (req, res) => {
  res.json(Object.values(usuarios))
})

app.post('/usuarios/:usuarioId/lembretes', async (req, res) => {
  const idLembrete = uuidv4()
  const { texto, apropriado } = req.body
  const usuarioId = req.params.usuarioId
  const lembrete = {
    id: idLembrete,
    usuarioId,
    texto,
    observacoes: [] 
  }
  try {
    await axios.post('http://192.168.0.11:10000/eventos', {
      tipo: 'LembreteCriado',
      dados: lembrete
    }) 
    res.status(201).json(lembrete)
  } catch (err) {
    console.error('Erro ao processar lembrete:', err) 
    res.status(500).json({ 
      erro: 'Falha ao processar lembrete',
      detalhes: err.message 
    })
  }
})

app.post('/eventos', (req, res) => {
  console.log('Evento recebido:', req.body)
  res.end()
})

const port = 8000
app.listen(port, () => {
  console.log(`Usuários. Porta ${port}.`)
})

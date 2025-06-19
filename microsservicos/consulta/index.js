
const axios = require('axios')
const express = require('express')
const app = express()
app.use(express.json())
// {
//   "usuarios": {
//     "1": {
//       "id": 1,
//       "nome": "João",
//        "endereco": "rua la de ca"
//       "lembretes": {
//         "1": {
//           "id": 1,
//           "texto": "Ver um filme",
//           "usuarioId": 1,
//           "observacoes": [
//             {
//               "id": 1001,
//               "texto": "Entre 04 e 08h",
//               "lembretesId": 1
//             }
//           ]
//         }
//       }
//     }
//   }
// }
const baseConsolidada = { usuarios: {}}

const funcoes = {
  UsuarioCriado: (usuario) => {
    baseConsolidada.usuarios[usuario.id] = {
      ...usuario,
      lembretes: {}
    }
  },

  LembreteCriado: (lembrete) => {
    baseConsolidada.usuarios[lembrete.usuarioId].lembretes[lembrete.id] = {
      ...lembrete,
      observacoes: []
    }
  },

  LembreteAtualizado: (lembrete) => {
    baseConsolidada.usuarios[lembrete.usuarioId].lembretes[lembrete.id] = {
      ...lembrete,
      observacoes: baseConsolidada.usuarios[lembrete.usuarioId].lembretes[lembrete.id].observacoes
    }
  },

  ObservacaoCriada: (obs) => {
    const usuario = Object.values(baseConsolidada.usuarios).find(u =>
      u.lembretes[obs.lembretesId]
    )
    usuario.lembretes[obs.lembretesId].observacoes.push(obs)
  },

  ObservacaoAtualizada: (obs) => {
    const usuario = Object.values(baseConsolidada.usuarios).find(u =>
      u.lembretes[obs.lembretesId]
    )
    const observacoes = usuario.lembretes[obs.lembretesId].observacoes
    const idx = observacoes.findIndex(o => o.id === obs.id)
    observacoes[idx] = obs
  }
}

//endpoint para obtenção da base consolidada (o front end usa)
app.get('/usuarios', (req, res) => {
  res.json(baseConsolidada)
})
//endpoint para receber eventos (o barramento usa)
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

const port = 6000
app.listen(port, async () => {
  console.log(`Consulta. Porta ${port}.`)
  const resp = await axios.get('http://192.168.1.124:10000/eventos')
  resp.data.forEach((eventoPerdido) => {
    try{
      funcoes[eventoPerdido.tipo](eventoPerdido.dados)
    }
    catch(e){}
  })
})
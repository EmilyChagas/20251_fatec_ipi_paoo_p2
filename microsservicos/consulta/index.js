
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
//               "lembreteId": 1
//             }
//           ]
//         }
//       }
//     }
//   }
// }
const baseConsolidada = {}

const funcoes = {
  UsuarioCriado: async (usuario) => {
    baseConsolidada.usuarios = { ...(baseConsolidada.usuarios || {}), [usuario.id]: { ...usuario, lembretes: {} } }
  },

  LembreteCriado: async (lembrete) => {
    const usuario = { ...(baseConsolidada.usuarios?.[lembrete.usuarioId] || {}), id: lembrete.usuarioId }
    usuario.lembretes = { ...(usuario.lembretes || {}), [lembrete.id]: { ...lembrete, observacoes: [] } }
    baseConsolidada.usuarios = { ...(baseConsolidada.usuarios || {}), [lembrete.usuarioId]: usuario }
  },

  ObservacaoCriada: async (observacao) => {
    const lembrete = Object.values(baseConsolidada.usuarios || {})
      .find(u => u?.lembretes?.[observacao.lembreteId])
      ?.lembretes?.[observacao.lembreteId];
    
    if (lembrete) {
      lembrete.observacoes = [...(lembrete.observacoes || []), observacao]
    } else {
      console.error('Lembrete não encontrado')
    }
  },

  ObservacaoAtualizada: async (observacao) => {
    const lembrete = Object.values(baseConsolidada.usuarios || {})
      .find(u => u?.lembretes?.[observacao.lembreteId])
      ?.lembretes?.[observacao.lembreteId];
    
    if (!lembrete) return console.error('Lembrete não encontrado')
    
    const indice = (lembrete.observacoes || []).findIndex(o => o.id === observacao.id)
    if (indice !== -1) lembrete.observacoes[indice] = observacao;
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
  const resp = await axios.get('http://192.168.0.11:10000/eventos')
  resp.data.forEach((eventoPerdido) => {
    try{
      funcoes[eventoPerdido.tipo](eventoPerdido.dados)
    }
    catch(e){}
  })
})
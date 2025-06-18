import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import express from 'express'
const app = express()
app.use(express.json())
const palavraChave = 'importante'
const ai = new GoogleGenAI({ apiKey: "AIzaSyCJbzwUTL3CMBvb-Q1mABqnOKTHXNPHOwI" })
const prompt = `Responda APENAS com 1 ou 0: mande 1 se o texto for apropriado (sem conteúdo ilegal, ofensivo ou perigoso) ou mande 0 se for inapropriado. Texto: `

async function classificarApropriado(texto) {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-pro" })
    const result = await model.generateContent(prompt + texto)
    const response = result.response
    const resposta = response.text().trim()
    return parseInt(resposta) === 1 ? true : false
  } catch (error) {
    console.error("Erro ao chamar a API:", error);
    return false;
  }
}


const funcoes = {
  ObservacaoCriada: async (observacao) => {
    observacao.apropriado = await classificarApropriado(observacao.texto) 
    console.log(observacao.status.includes(palavraChave))
    observacao.status = observacao.texto.includes(palavraChave) 
      console.log(observacao)
    await axios.post(
        'http://192.168.0.11:10000/eventos',{
          tipo: 'ObservacaoClassificada',
          dados: observacao
        }
    )
  },
  LembreteCriado: async (lembrete) => {
        lembrete.apropriado = await classificarApropriado(lembrete.texto)
        lembrete.status = lembrete.texto.length <= 50 ? 'importante' : 'comum'
        await axios.post('http://192.168.0.11:10000/eventos', {
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
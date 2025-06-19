import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import express from 'express'
const app = express()
app.use(express.json())
const palavraChave = 'importante'
const ai = new GoogleGenAI({ apiKey: "AIzaSyCJbzwUTL3CMBvb-Q1mABqnOKTHXNPHOwI" })
const prompt = `Responda APENAS com 1 ou 0: MANDE 1 se o texto for apropriado (sem conteúdo ilegal, ofensivo ou perigoso) ou MANDE 0 se for inapropriado. Texto: `

async function classificarApropriado(texto) {
  const conteudo = `${prompt}${texto}`;
  try {
        const result = await ai.models.generateContent({
          model: 'gemini-2.0-flash-001', 
          contents: conteudo
        })
    const response = result.response
    const resposta = result.text.trim()
    return parseInt(resposta) === 1 ? 1 : 0
  } catch (error) {
    console.error("Erro ao chamar a API:", error);
    return false;
  }
}


const funcoes = {
 ObservacaoCriada: async (observacao) => {
    //1. Atualizar o status da observação
    //se o texto incluir a palavraChave, trocar o status para importante
    //caso contrário, trocar o status para comum
    console.log(observacao.status.includes(palavraChave))
    observacao.status = observacao.texto.includes(palavraChave) ? 'importante' : 'comum'
    observacao.apropriado = await classificarApropriado(observacao.texto)===1? 'IsApropriado' : 'NoAprovado'
      console.log(observacao)
    //emitir um evento do tipo ObservacaoClassificada, direcionado ao barramentpo
    //use a observacao como "dados"
    //emita o evento com a axios
    await axios.post(
        'http://192.168.1.124:10000/eventos',{
          tipo: 'ObservacaoClassificada',
          dados: observacao
        }
    )
  },
  LembreteCriado: async (lembrete) => {
    lembrete.status = lembrete.texto.length <= 50 ? 'importante' : 'comum'
    lembrete.apropriado = await classificarApropriado(lembrete.texto)===1? 'IsApropriado' : 'NoAprovado'
    await axios.post('http://192.168.1.124:10000/eventos', {
        tipo: 'LembreteClassificado',
        dados: lembrete
      }
    )
  }
}


app.post('/eventos', async (req, res) => {
const { tipo, dados } = req.body;
  const handler = funcoes[tipo];

  if (typeof handler === 'function') {
    try {
      await handler(dados);
    } catch (err) {
      console.error(`Erro ao tratar ${tipo}:`, err)
    }
  } else {
    console.log(`Evento ignorado em Classificação: ${tipo}`)
  }

  res.end();
})



const port = 7000
app.listen(port, async() =>  {
  console.log(`Classificação. Porta ${port}.`);
  const resp = await axios.get('http://192.168.1.124:10000/eventos')
  resp.data.forEach((eventoPerdido) => {
    try{
      funcoes[eventoPerdido.tipo](eventoPerdido.dados)
    }
    catch(e){}
  })
})


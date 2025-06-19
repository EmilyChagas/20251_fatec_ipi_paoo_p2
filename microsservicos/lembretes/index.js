const axios = require('axios');
const express = require('express');
const app = express();
app.use(express.json());

const lembretesPorUsuario = {};
let id = 0;

// Handlers de eventos
const funcoes = {
  LembreteClassificado: async (lembrete) => {
    const lembretes = lembretesPorUsuario[lembrete.usuarioId] || [];
    const lembreteParaAtualizar = lembretes.find(o => o.id === lembrete.id);
    if (!lembreteParaAtualizar) {
      console.log('Lembrete não encontrado para atualização.');
      return;
    }
    lembreteParaAtualizar.status = lembrete.status;
    lembreteParaAtualizar.apropriado = lembrete.apropriado;
    await axios.post('http://192.168.1.124:10000/eventos', {
      tipo: 'LembreteAtualizado',
      dados: lembreteParaAtualizar
    });
  },

  UsuarioCriado: async () => {
    console.log('Evento UsuarioCriado recebido (ignorado em lembretes).');
  },

  LembreteCriado: async () => {}
};

app.post('/usuarios/:usuarioId/lembretes', (req, res) => {
  id = id + 1;
  const { texto } = req.body;
  const lembretesDoUsuario = lembretesPorUsuario[req.params.usuarioId] || [];

  const lembrete = {
    id,
    usuarioId: req.params.usuarioId,
    texto,
    status: 'aguardando',
    apropriado: 'aguardando'
  };

  lembretesDoUsuario.push(lembrete);
  lembretesPorUsuario[req.params.usuarioId] = lembretesDoUsuario;

  axios.post('http://192.168.1.124:10000/eventos', {
    tipo: 'LembreteCriado',
    dados: lembrete
  });

  res.status(201).json(lembrete);
});

app.get('/usuarios/:usuarioId/lembretes', (req, res) => {
  res.json(lembretesPorUsuario[req.params.usuarioId] || []);
});

app.post('/eventos', async (req, res) => {
  const { tipo, dados } = req.body;
  console.log('Evento recebido em lembretes:', tipo);

  const funcao = funcoes[tipo];
  if (typeof funcao === 'function') {
    await funcao(dados);
  } else {
    console.log(`Nenhuma função para tratar o evento: ${tipo}`);
  }

  res.end();
});

const port = 4000;
app.listen(port, () => {
  console.log(`lembretes. Porta ${port}.`);
});


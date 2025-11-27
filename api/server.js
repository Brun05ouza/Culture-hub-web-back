const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const candidateDirs = [
  path.join(__dirname, "web"),
  path.join(__dirname, "..", "web"),
];
const WEB_DIR = candidateDirs.find((p) => fs.existsSync(p)) || candidateDirs[1];

app.use(express.static(WEB_DIR));

console.log("🌐 Servindo arquivos estáticos de:", WEB_DIR);

const eventos = [
  {
    id: 1,
    tituloEvento: "Festival de músicas",
    descricao: "Evento de música com diversas atrações",
    categoria: "Musica",
    dataInicio: new Date(2025, 7, 15),
    dataFim: new Date(2025, 7, 15),
    localizacao: "Sesc Teresópolis, varzea",
    preco: 50.0,
    disponibilidade: "Disponivel",
    criadorId: null,
    participantes: [],
    imagem: null,
  },
];

const usuarios = [];
const inscricoes = [];

app.get("/api/eventos/:id", (req, res) => {
  const id = Number(req.params.id);
  const evento = eventos.find((l) => l.id === id);
  if (!evento) return res.status(404).json({ error: "Evento não encontrado" });
  return res.json(evento);
});

app.get("/api/eventos", (req, res) => {
  const { categoria, status, criadorId, search } = req.query;
  let filtered = [...eventos];

  if (categoria) filtered = filtered.filter(e => e.categoria.toLowerCase() === categoria.toLowerCase());
  if (criadorId) filtered = filtered.filter(e => e.criadorId === Number(criadorId));
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(e => 
      e.tituloEvento.toLowerCase().includes(term) || 
      e.descricao.toLowerCase().includes(term)
    );
  }
  if (status) {
    const now = new Date();
    filtered = filtered.filter(e => {
      const inicio = new Date(e.dataInicio);
      const fim = new Date(e.dataFim);
      if (status === 'ongoing') return now >= inicio && now <= fim;
      if (status === 'upcoming') return now < inicio;
      if (status === 'ended') return now > fim;
      return true;
    });
  }

  return res.json(filtered);
});

app.post("/api/eventos", (req, res) => {
  const b = req.body;

  const viaCriar = b.eventTitle || b.eventDescription || b.eventCategory || b.startDate;
  const viaCalendario = b.eventName || b.eventDate || b.eventTime;

  const novoEvento = viaCriar
    ? {
        tituloEvento: b.eventTitle,
        descricao: b.eventDescription,
        categoria: b.eventCategory || "Outros",
        dataInicio: b.startDate,
        dataFim: b.endDate || b.startDate,
        localizacao: b.eventLocation,
        preco: Number(b.ticketPrice || 0),
        disponibilidade: Number(b.ticketAvailability || 0) > 0 ? "Disponivel" : "Encerrado",
        criadorId: b.criadorId || null,
        participantes: [],
        imagem: b.imagem || null,
      }
    : viaCalendario
    ? {
        tituloEvento: b.eventName,
        descricao: b.eventDescription || "",
        categoria: "Outros",
        dataInicio: `${b.eventDate}T${b.eventTime || "00:00"}`,
        dataFim: `${b.eventDate}T${b.eventTime || "00:00"}`,
        localizacao: b.eventLocation,
        preco: 0,
        disponibilidade: "Disponivel",
        criadorId: b.criadorId || null,
        participantes: [],
        imagem: null,
      }
    : {
        tituloEvento: b.tituloEvento,
        descricao: b.descricao,
        categoria: b.categoria || "Outros",
        dataInicio: b.dataInicio,
        dataFim: b.dataFim || b.dataInicio,
        localizacao: b.localizacao,
        preco: Number(b.preco || 0),
        disponibilidade: b.disponibilidade || "Disponivel",
        criadorId: b.criadorId || null,
        participantes: [],
        imagem: b.imagem || null,
      };

  const camposObrigatorios = ["tituloEvento", "descricao", "categoria", "dataInicio", "dataFim", "localizacao"];
  const todosPreenchidos = camposObrigatorios.every((c) => novoEvento[c]);
  if (!todosPreenchidos) {
    return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos" });
  }

  novoEvento.id = eventos.length + 1;
  eventos.push(novoEvento);
  return res.status(201).json(novoEvento);
});

app.put("/api/eventos/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = eventos.findIndex((e) => e.id === id);
  if (index === -1) return res.status(404).json({ error: "Evento não encontrado" });

  const b = req.body;
  eventos[index] = { ...eventos[index], ...b, id };
  return res.json(eventos[index]);
});

app.delete("/api/eventos/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = eventos.findIndex((e) => e.id === id);
  if (index === -1) return res.status(404).json({ error: "Evento não encontrado" });
  eventos.splice(index, 1);
  return res.status(204).send();
});

// Endpoints de usuário
app.post("/api/cadastro", (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
  }
  
  const usuarioExistente = usuarios.find(u => u.email === email);
  if (usuarioExistente) {
    return res.status(400).json({ error: "Email já cadastrado" });
  }
  
  const novoUsuario = {
    id: usuarios.length + 1,
    name,
    email,
    password,
    picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`
  };
  
  usuarios.push(novoUsuario);
  
  const { password: _, ...usuarioSemSenha } = novoUsuario;
  return res.status(201).json(usuarioSemSenha);
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }
  
  const usuario = usuarios.find(u => u.email === email && u.password === password);
  if (!usuario) {
    return res.status(401).json({ error: "Email ou senha incorretos" });
  }
  
  const { password: _, ...usuarioSemSenha } = usuario;
  return res.json(usuarioSemSenha);
});

app.get("/api/usuarios/:id", (req, res) => {
  const id = Number(req.params.id);
  const usuario = usuarios.find(u => u.id === id);
  if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });
  const { password, ...usuarioSemSenha } = usuario;
  return res.json(usuarioSemSenha);
});

app.put("/api/usuarios/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = usuarios.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ error: "Usuário não encontrado" });

  const { name, email, picture } = req.body;
  usuarios[index] = { ...usuarios[index], name, email, picture };
  const { password, ...usuarioSemSenha } = usuarios[index];
  return res.json(usuarioSemSenha);
});

app.get("/api/usuarios", (req, res) => {
  const usuariosSemSenha = usuarios.map(({ password, ...usuario }) => usuario);
  return res.json(usuariosSemSenha);
});

app.post("/api/eventos/:id/inscrever", (req, res) => {
  const eventoId = Number(req.params.id);
  const { usuarioId } = req.body;

  const evento = eventos.find(e => e.id === eventoId);
  if (!evento) return res.status(404).json({ error: "Evento não encontrado" });

  if (evento.participantes.includes(usuarioId)) {
    return res.status(400).json({ error: "Usuário já inscrito" });
  }

  evento.participantes.push(usuarioId);
  inscricoes.push({ eventoId, usuarioId, data: new Date() });
  return res.json({ message: "Inscrição realizada com sucesso" });
});

app.delete("/api/eventos/:id/inscrever", (req, res) => {
  const eventoId = Number(req.params.id);
  const { usuarioId } = req.body;

  const evento = eventos.find(e => e.id === eventoId);
  if (!evento) return res.status(404).json({ error: "Evento não encontrado" });

  evento.participantes = evento.participantes.filter(id => id !== usuarioId);
  const inscIndex = inscricoes.findIndex(i => i.eventoId === eventoId && i.usuarioId === usuarioId);
  if (inscIndex !== -1) inscricoes.splice(inscIndex, 1);

  return res.json({ message: "Inscrição cancelada" });
});

app.get("/api/usuarios/:id/eventos", (req, res) => {
  const usuarioId = Number(req.params.id);
  const criados = eventos.filter(e => e.criadorId === usuarioId);
  const inscritos = eventos.filter(e => e.participantes.includes(usuarioId));
  return res.json({ criados, inscritos });
});

app.get("*", (_, res) => {
  res.sendFile(path.join(WEB_DIR, "telaPrincipal.html"));
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  
  console.log('\n✔️ Servidor rodando em:');
  console.log(`   Local:    http://localhost:${PORT}`);
  addresses.forEach(addr => {
    console.log(`   Rede:     http://${addr}:${PORT}`);
  });
  console.log('');
});

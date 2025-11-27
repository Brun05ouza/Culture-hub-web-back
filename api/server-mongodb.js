const express = require("express");
const path = require("path");
const fs = require("fs");
const connectDB = require("./db");
const Usuario = require("./models/Usuario");
const Evento = require("./models/Evento");

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

connectDB();

// Eventos
app.get("/api/eventos/:id", async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) return res.status(404).json({ error: "Evento não encontrado" });
    res.json(evento);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/eventos", async (req, res) => {
  try {
    const { categoria, status, criadorId, search } = req.query;
    let query = {};

    if (categoria) query.categoria = new RegExp(categoria, 'i');
    if (criadorId) query.criadorId = criadorId;
    if (search) query.$or = [
      { tituloEvento: new RegExp(search, 'i') },
      { descricao: new RegExp(search, 'i') }
    ];

    let eventos = await Evento.find(query);

    if (status) {
      const now = new Date();
      eventos = eventos.filter(e => {
        if (status === 'ongoing') return now >= e.dataInicio && now <= e.dataFim;
        if (status === 'upcoming') return now < e.dataInicio;
        if (status === 'ended') return now > e.dataFim;
        return true;
      });
    }

    res.json(eventos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/eventos", async (req, res) => {
  try {
    const b = req.body;
    const viaCriar = b.eventTitle || b.eventDescription;
    const viaCalendario = b.eventName || b.eventDate;

    const eventoData = viaCriar ? {
      tituloEvento: b.eventTitle,
      descricao: b.eventDescription,
      categoria: b.eventCategory || "Outros",
      dataInicio: b.startDate,
      dataFim: b.endDate || b.startDate,
      localizacao: b.eventLocation,
      preco: Number(b.ticketPrice || 0),
      disponibilidade: Number(b.ticketAvailability || 0) > 0 ? "Disponivel" : "Encerrado",
      criadorId: b.criadorId,
      imagem: b.imagem,
    } : viaCalendario ? {
      tituloEvento: b.eventName,
      descricao: b.eventDescription || "",
      categoria: "Outros",
      dataInicio: `${b.eventDate}T${b.eventTime || "00:00"}`,
      dataFim: `${b.eventDate}T${b.eventTime || "00:00"}`,
      localizacao: b.eventLocation,
      preco: 0,
      disponibilidade: "Disponivel",
      criadorId: b.criadorId,
    } : b;

    const evento = await Evento.create(eventoData);
    res.status(201).json(evento);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/eventos/:id", async (req, res) => {
  try {
    const evento = await Evento.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!evento) return res.status(404).json({ error: "Evento não encontrado" });
    res.json(evento);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/eventos/:id", async (req, res) => {
  try {
    const evento = await Evento.findByIdAndDelete(req.params.id);
    if (!evento) return res.status(404).json({ error: "Evento não encontrado" });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Usuários
app.post("/api/cadastro", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ error: "Email já cadastrado" });

    const usuario = await Usuario.create({
      name,
      email,
      password,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`
    });

    const { password: _, ...usuarioSemSenha } = usuario.toObject();
    res.status(201).json(usuarioSemSenha);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email, password });
    
    if (!usuario) return res.status(401).json({ error: "Email ou senha incorretos" });

    const { password: _, ...usuarioSemSenha } = usuario.toObject();
    res.json(usuarioSemSenha);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/usuarios/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-password');
    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/usuarios/:id", async (req, res) => {
  try {
    const { name, email, picture } = req.body;
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { name, email, picture },
      { new: true }
    ).select('-password');
    
    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(usuario);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/eventos/:id/inscrever", async (req, res) => {
  try {
    const { usuarioId } = req.body;
    const evento = await Evento.findById(req.params.id);
    
    if (!evento) return res.status(404).json({ error: "Evento não encontrado" });
    if (evento.participantes.includes(usuarioId)) {
      return res.status(400).json({ error: "Usuário já inscrito" });
    }

    evento.participantes.push(usuarioId);
    await evento.save();
    res.json({ message: "Inscrição realizada com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/eventos/:id/inscrever", async (req, res) => {
  try {
    const { usuarioId } = req.body;
    const evento = await Evento.findById(req.params.id);
    
    if (!evento) return res.status(404).json({ error: "Evento não encontrado" });

    evento.participantes = evento.participantes.filter(id => id.toString() !== usuarioId);
    await evento.save();
    res.json({ message: "Inscrição cancelada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/usuarios/:id/eventos", async (req, res) => {
  try {
    const criados = await Evento.find({ criadorId: req.params.id });
    const inscritos = await Evento.find({ participantes: req.params.id });
    res.json({ criados, inscritos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

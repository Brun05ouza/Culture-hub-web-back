const Evento = require('../models/Evento');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose');

exports.getEventos = async (req, res) => {
  try {
  const { categoria, status, criadorId, search, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  let query = {};

  if (categoria) query.categoria = new RegExp(categoria, 'i');
  if (criadorId) query.criadorId = criadorId;
  if (search) {
    query.$or = [
      { tituloEvento: new RegExp(search, 'i') },
      { descricao: new RegExp(search, 'i') }
    ];
  }

  let eventos = await Evento.find(query)
    .populate('criadorId', 'name email picture')
    .skip(skip)
    .limit(parseInt(limit))
    .sort('-createdAt');

  if (status) {
    const now = new Date();
    eventos = eventos.filter(e => {
      if (status === 'ongoing') return now >= e.dataInicio && now <= e.dataFim;
      if (status === 'upcoming') return now < e.dataInicio;
      if (status === 'ended') return now > e.dataFim;
      return true;
    });
  }

  const total = await Evento.countDocuments(query);

  res.json({
    eventos,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEvento = async (req, res) => {
  try {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  const evento = await Evento.findById(req.params.id)
    .populate('criadorId', 'name email picture')
    .populate('participantes', 'name picture');

  if (!evento) {
    return res.status(404).json({ error: 'Evento não encontrado' });
  }

  res.json(evento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createEvento = async (req, res) => {
  try {
  const b = req.body;
  const viaCriar = b.eventTitle || b.eventDescription;
  const viaCalendario = b.eventName || b.eventDate;

  let eventoData = viaCriar ? {
    tituloEvento: b.eventTitle,
    descricao: b.eventDescription,
    categoria: b.eventCategory || 'Outros',
    dataInicio: b.startDate,
    dataFim: b.endDate || b.startDate,
    localizacao: b.eventLocation,
    preco: Number(b.ticketPrice || 0),
    disponibilidade: Number(b.ticketAvailability || 0) > 0 ? 'Disponivel' : 'Encerrado',
    criadorId: req.user?.id || b.criadorId,
    imagem: b.imagem
  } : viaCalendario ? {
    tituloEvento: b.eventName,
    descricao: b.eventDescription || '',
    categoria: 'Outros',
    dataInicio: `${b.eventDate}T${b.eventTime || '00:00'}`,
    dataFim: `${b.eventDate}T${b.eventTime || '00:00'}`,
    localizacao: b.eventLocation,
    preco: 0,
    disponibilidade: 'Disponivel',
    criadorId: req.user?.id || b.criadorId
  } : { ...b, criadorId: req.user?.id || b.criadorId };

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'eventos'
    });
    eventoData.imagem = result.secure_url;
  }

  const evento = await Evento.create(eventoData);
  res.status(201).json(evento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateEvento = async (req, res) => {
  try {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  let evento = await Evento.findById(req.params.id);

  if (!evento) {
    return res.status(404).json({ error: 'Evento não encontrado' });
  }

  if (evento.criadorId.toString() !== req.user?.id && req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Sem permissão para editar este evento' });
  }

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'eventos'
    });
    req.body.imagem = result.secure_url;
  }

  evento = await Evento.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json(evento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteEvento = async (req, res) => {
  try {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  const evento = await Evento.findById(req.params.id);

  if (!evento) {
    return res.status(404).json({ error: 'Evento não encontrado' });
  }

  if (evento.criadorId.toString() !== req.user?.id && req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Sem permissão para deletar este evento' });
  }

  await evento.deleteOne();
  res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.inscreverEvento = async (req, res) => {
  try {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  const evento = await Evento.findById(req.params.id);

  if (!evento) {
    return res.status(404).json({ error: 'Evento não encontrado' });
  }

  const usuarioId = req.user?.id || req.body.usuarioId;

  if (evento.participantes.includes(usuarioId)) {
    return res.status(400).json({ error: 'Usuário já inscrito' });
  }

  evento.participantes.push(usuarioId);
  await evento.save();

  res.json({ message: 'Inscrição realizada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelarInscricao = async (req, res) => {
  try {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  const evento = await Evento.findById(req.params.id);

  if (!evento) {
    return res.status(404).json({ error: 'Evento não encontrado' });
  }

  const usuarioId = req.user?.id || req.body.usuarioId;

  evento.participantes = evento.participantes.filter(
    id => id.toString() !== usuarioId
  );
  await evento.save();

  res.json({ message: 'Inscrição cancelada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserEventos = async (req, res) => {
  try {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  const criados = await Evento.find({ criadorId: req.params.id });
  const inscritos = await Evento.find({ participantes: req.params.id });

  res.json({ criados, inscritos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

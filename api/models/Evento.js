const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  tituloEvento: { type: String, required: true },
  descricao: { type: String, required: true },
  categoria: { type: String, required: true },
  dataInicio: { type: Date, required: true },
  dataFim: { type: Date, required: true },
  localizacao: { type: String, required: true },
  preco: { type: Number, default: 0 },
  disponibilidade: { type: String, default: 'Disponivel' },
  criadorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  participantes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
  imagem: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Evento', eventoSchema);

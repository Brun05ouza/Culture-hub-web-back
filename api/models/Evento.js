const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  tituloEvento: { type: String, required: true, index: true },
  descricao: { type: String, required: true },
  categoria: { type: String, required: true, index: true },
  dataInicio: { type: Date, required: true, index: true },
  dataFim: { type: Date, required: true },
  localizacao: { type: String, required: true },
  preco: { type: Number, default: 0 },
  disponibilidade: { type: String, default: 'Disponivel' },
  criadorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', index: true },
  participantes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
  imagem: String,
  capacidade: { type: Number, default: 0 },
  status: { type: String, enum: ['ativo', 'cancelado', 'encerrado'], default: 'ativo' },
  createdAt: { type: Date, default: Date.now }
});

eventoSchema.index({ tituloEvento: 'text', descricao: 'text' });

module.exports = mongoose.model('Evento', eventoSchema);

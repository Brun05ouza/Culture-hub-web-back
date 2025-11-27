const express = require('express');
const {
  getEventos,
  getEvento,
  createEvento,
  updateEvento,
  deleteEvento,
  inscreverEvento,
  cancelarInscricao,
  getUserEventos
} = require('../controllers/eventoController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

router.get('/', getEventos);
router.get('/:id', getEvento);
router.post('/', upload.single('imagem'), createEvento);
router.put('/:id', protect, upload.single('imagem'), updateEvento);
router.delete('/:id', protect, deleteEvento);
router.post('/:id/inscrever', inscreverEvento);
router.delete('/:id/inscrever', cancelarInscricao);

module.exports = router;

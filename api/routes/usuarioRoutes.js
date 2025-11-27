const express = require('express');
const { getUsuario, updateUsuario, getUsuarios } = require('../controllers/usuarioController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

const { deleteUsuario } = require('../controllers/usuarioController');

router.get('/', getUsuarios);
router.get('/:id', getUsuario);
router.put('/:id', protect, updateUsuario);
router.delete('/:id', protect, deleteUsuario);

module.exports = router;

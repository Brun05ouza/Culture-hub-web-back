const express = require('express');
const { cadastro, login, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/cadastro', cadastro);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;

const Usuario = require('../models/Usuario');

exports.cadastro = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const usuario = await Usuario.create({
      name,
      email,
      password,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`
    });

    const token = usuario.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: usuario._id,
        name: usuario.name,
        email: usuario.email,
        picture: usuario.picture
      }
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ error: error.message || 'Erro ao cadastrar usuário' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const usuario = await Usuario.findOne({ email }).select('+password');
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isMatch = await usuario.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = usuario.getSignedJwtToken();

    res.json({
      success: true,
      token,
      user: {
        id: usuario._id,
        name: usuario.name,
        email: usuario.email,
        picture: usuario.picture
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: error.message || 'Erro ao fazer login' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user.id);
    res.json({ success: true, user: usuario });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

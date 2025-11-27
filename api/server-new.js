require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./db');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Conectar ao MongoDB
connectDB();

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde'
});
app.use('/api/', limiter);

// Body parser e compression
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Servir arquivos estáticos
const candidateDirs = [
  path.join(__dirname, 'web'),
  path.join(__dirname, '..', 'web'),
];
const WEB_DIR = candidateDirs.find(p => fs.existsSync(p)) || candidateDirs[1];
app.use(express.static(WEB_DIR));

// Criar pasta de uploads se não existir
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

console.log('🌐 Servindo arquivos estáticos de:', WEB_DIR);

// Rotas da API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/eventos', require('./routes/eventoRoutes'));

// Rota para eventos do usuário
app.get('/api/usuarios/:id/eventos', require('./controllers/eventoController').getUserEventos);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handler
app.use(errorHandler);

// Fallback para SPA (deve ser o último)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Rota não encontrada' });
  }
  res.sendFile(path.join(WEB_DIR, 'telaPrincipal.html'));
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
  console.log(`\n🔒 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
});

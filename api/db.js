const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/culturehub');
    console.log('✅ MongoDB conectado');
  } catch (err) {
    console.error('❌ Erro ao conectar MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

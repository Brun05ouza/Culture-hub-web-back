const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ Erro MongoDB:', err.message);
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;

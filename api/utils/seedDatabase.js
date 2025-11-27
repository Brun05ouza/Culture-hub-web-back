require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');
const Evento = require('../models/Evento');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado');
  } catch (err) {
    console.error('❌ Erro ao conectar MongoDB:', err.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Limpar dados existentes
    await Usuario.deleteMany({});
    await Evento.deleteMany({});
    console.log('🗑️  Dados antigos removidos');

    // Criar usuários
    const usuarios = await Usuario.create([
      {
        name: 'Admin Culture Hub',
        email: 'admin@culturehub.com',
        password: 'admin123',
        role: 'admin',
        picture: 'https://ui-avatars.com/api/?name=Admin&background=667eea&color=fff'
      },
      {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'senha123',
        picture: 'https://ui-avatars.com/api/?name=João+Silva&background=3b82f6&color=fff'
      },
      {
        name: 'Maria Santos',
        email: 'maria@example.com',
        password: 'senha123',
        picture: 'https://ui-avatars.com/api/?name=Maria+Santos&background=ec4899&color=fff'
      }
    ]);
    console.log('✅ Usuários criados:', usuarios.length);

    // Criar eventos
    const eventos = await Evento.create([
      {
        tituloEvento: 'Festival de Música Eletrônica',
        descricao: 'Grande festival com os melhores DJs do Brasil',
        categoria: 'Musica',
        dataInicio: new Date('2025-08-15T18:00:00'),
        dataFim: new Date('2025-08-16T06:00:00'),
        localizacao: 'Parque Ibirapuera, São Paulo',
        preco: 150,
        capacidade: 5000,
        criadorId: usuarios[0]._id,
        imagem: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800'
      },
      {
        tituloEvento: 'Exposição de Arte Contemporânea',
        descricao: 'Obras de artistas brasileiros e internacionais',
        categoria: 'Arte',
        dataInicio: new Date('2025-07-01T10:00:00'),
        dataFim: new Date('2025-07-31T18:00:00'),
        localizacao: 'MASP, São Paulo',
        preco: 30,
        capacidade: 200,
        criadorId: usuarios[1]._id,
        imagem: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800'
      },
      {
        tituloEvento: 'Teatro: Hamlet',
        descricao: 'Clássico de Shakespeare em versão moderna',
        categoria: 'Teatro',
        dataInicio: new Date('2025-06-20T20:00:00'),
        dataFim: new Date('2025-06-20T22:30:00'),
        localizacao: 'Teatro Municipal, Rio de Janeiro',
        preco: 80,
        capacidade: 300,
        criadorId: usuarios[1]._id,
        imagem: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800'
      },
      {
        tituloEvento: 'Cinema ao Ar Livre',
        descricao: 'Sessão especial de clássicos do cinema brasileiro',
        categoria: 'Cinema',
        dataInicio: new Date('2025-06-10T19:00:00'),
        dataFim: new Date('2025-06-10T23:00:00'),
        localizacao: 'Parque Villa-Lobos, São Paulo',
        preco: 0,
        capacidade: 500,
        criadorId: usuarios[2]._id,
        imagem: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800'
      },
      {
        tituloEvento: 'Workshop de Fotografia',
        descricao: 'Aprenda técnicas profissionais de fotografia',
        categoria: 'Educacao',
        dataInicio: new Date('2025-06-25T14:00:00'),
        dataFim: new Date('2025-06-25T18:00:00'),
        localizacao: 'Centro Cultural, Belo Horizonte',
        preco: 120,
        capacidade: 30,
        criadorId: usuarios[2]._id,
        imagem: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800'
      }
    ]);
    console.log('✅ Eventos criados:', eventos.length);

    // Adicionar participantes
    eventos[0].participantes.push(usuarios[1]._id, usuarios[2]._id);
    eventos[1].participantes.push(usuarios[2]._id);
    eventos[3].participantes.push(usuarios[0]._id, usuarios[1]._id);
    
    await Promise.all(eventos.map(e => e.save()));
    console.log('✅ Participantes adicionados');

    console.log('\n🎉 Database populado com sucesso!\n');
    console.log('📧 Credenciais de teste:');
    console.log('   Admin: admin@culturehub.com / admin123');
    console.log('   User1: joao@example.com / senha123');
    console.log('   User2: maria@example.com / senha123\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao popular database:', err);
    process.exit(1);
  }
};

seedData();

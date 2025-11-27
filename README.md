# 🎭 Culture Hub - Plataforma de Eventos Culturais

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-green)
![License](https://img.shields.io/badge/license-MIT-blue)

Sistema completo de gerenciamento de eventos culturais com autenticação JWT, upload de imagens e funcionalidades avançadas.

## ✨ Funcionalidades

- 🔐 Autenticação JWT com bcrypt
- 📅 Criação e gerenciamento de eventos
- ❤️ Sistema de favoritos
- 🔔 Notificações
- 📤 Compartilhamento de eventos
- 🖼️ Upload de imagens
- 🔍 Busca e filtros avançados
- 📱 Design responsivo

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- MongoDB (local ou Atlas)
- Git

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/culture-hub.git
cd culture-hub
```

2. **Instale as dependências**
```bash
cd api
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o .env com suas credenciais
```

4. **Popule o banco de dados (opcional)**
```bash
npm run seed
```

5. **Inicie o servidor**
```bash
npm run dev
```

6. **Acesse**
```
http://localhost:3000
```

## 🚀 Uso

### Credenciais de Teste (após seed)
```
Admin: admin@culturehub.com / admin123
User1: joao@example.com / senha123
User2: maria@example.com / senha123
```

## 📚 API Endpoints

### Autenticação
- `POST /api/auth/cadastro` - Criar conta
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Perfil (requer token)

### Eventos
- `GET /api/eventos` - Listar eventos
- `POST /api/eventos` - Criar evento
- `PUT /api/eventos/:id` - Editar evento
- `DELETE /api/eventos/:id` - Deletar evento

### Usuários
- `GET /api/usuarios` - Listar usuários
- `PUT /api/usuarios/:id` - Atualizar perfil
- `DELETE /api/usuarios/:id` - Deletar usuário

## 🛠️ Tecnologias

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT + Bcrypt
- Multer + Cloudinary

### Frontend
- HTML5 + CSS3
- JavaScript (Vanilla)
- Tailwind CSS

### Segurança
- Helmet
- CORS
- Rate Limiting
- Express Validator

## 📁 Estrutura

```
culture-hub/
├── api/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── utils/
│   └── server-new.js
├── web/
│   ├── css/
│   ├── js/
│   ├── img/
│   └── *.html
└── README.md
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

MIT

## 👥 Autores

- Bruno Soares
- [Adicione outros colaboradores]

## 📞 Contato

- Email: contato@culturehub.com
- Website: https://culturehub.com

# Configurar MongoDB Atlas (Gratuito)

## 1. Criar Conta no MongoDB Atlas

1. Acesse: https://www.mongodb.com/cloud/atlas/register
2. Crie uma conta gratuita
3. Escolha o plano **FREE** (M0 Sandbox)

## 2. Criar Cluster

1. Após login, clique em **"Build a Database"**
2. Escolha **FREE** (Shared)
3. Escolha o provedor: **AWS** ou **Google Cloud**
4. Região: Escolha a mais próxima (ex: São Paulo)
5. Cluster Name: `CultureHub` (ou qualquer nome)
6. Clique em **"Create"**

## 3. Configurar Acesso

### Criar Usuário do Banco:
1. Vá em **Database Access** (menu lateral)
2. Clique em **"Add New Database User"**
3. Username: `culturehub`
4. Password: Gere uma senha forte (copie e guarde!)
5. Database User Privileges: **Read and write to any database**
6. Clique em **"Add User"**

### Liberar IP:
1. Vá em **Network Access** (menu lateral)
2. Clique em **"Add IP Address"**
3. Clique em **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Clique em **"Confirm"**

## 4. Obter String de Conexão

1. Volte para **Database** (menu lateral)
2. Clique em **"Connect"** no seu cluster
3. Escolha **"Connect your application"**
4. Driver: **Node.js**
5. Copie a string de conexão:
```
mongodb+srv://culturehub:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

## 5. Configurar no Projeto

1. Crie o arquivo `.env` na pasta `api`:
```bash
cd api
echo MONGODB_URI=sua_string_aqui > .env
```

2. Edite o arquivo `.env` e cole sua string:
```
MONGODB_URI=mongodb+srv://culturehub:SUA_SENHA@cluster0.xxxxx.mongodb.net/culturehub?retryWrites=true&w=majority
PORT=3000
```

**IMPORTANTE**: Substitua `<password>` pela senha que você criou!

## 6. Iniciar com MongoDB

### Opção 1: Usar o novo servidor
```bash
cd api
node server-mongodb.js
```

### Opção 2: Atualizar package.json
Edite `api/package.json`:
```json
{
  "scripts": {
    "start": "node server-mongodb.js",
    "dev": "nodemon server-mongodb.js",
    "start:local": "node server.js"
  }
}
```

Depois rode:
```bash
npm start
```

## 7. Verificar Conexão

Se conectou com sucesso, você verá:
```
✅ MongoDB conectado
🌐 Servindo arquivos estáticos de: ...
✔️ Servidor rodando em:
   Local:    http://localhost:3000
   Rede:     http://192.168.x.x:3000
```

## Alternativas ao MongoDB Atlas

### 1. **Supabase** (PostgreSQL - Gratuito)
- https://supabase.com
- 500MB storage grátis
- PostgreSQL gerenciado

### 2. **PlanetScale** (MySQL - Gratuito)
- https://planetscale.com
- MySQL serverless
- 5GB storage grátis

### 3. **Cockroach DB** (PostgreSQL - Gratuito)
- https://www.cockroachlabs.com
- PostgreSQL compatível
- 5GB storage grátis

### 4. **Railway** (PostgreSQL/MySQL/MongoDB)
- https://railway.app
- $5 crédito grátis/mês
- Suporta múltiplos bancos

### 5. **Render** (PostgreSQL)
- https://render.com
- PostgreSQL grátis
- 90 dias de retenção

## Troubleshooting

### Erro: "MongoServerError: bad auth"
- Verifique usuário e senha no `.env`
- Certifique-se de substituir `<password>` pela senha real

### Erro: "connect ETIMEDOUT"
- Verifique se liberou o IP (0.0.0.0/0) no Network Access
- Verifique sua conexão com internet

### Erro: "ENOENT: no such file or directory, open '.env'"
- Crie o arquivo `.env` na pasta `api`
- Certifique-se que está na pasta correta

### Dados não aparecem
- O banco começa vazio
- Cadastre novos usuários e eventos
- Os dados antigos (em memória) não migram automaticamente

## Migrar Dados Antigos (Opcional)

Se quiser manter os dados de teste, adicione no `server-mongodb.js` após `connectDB()`:

```javascript
// Seed inicial (executar apenas uma vez)
const seedData = async () => {
  const count = await Evento.countDocuments();
  if (count === 0) {
    await Evento.create({
      tituloEvento: "Festival de músicas",
      descricao: "Evento de música com diversas atrações",
      categoria: "Musica",
      dataInicio: new Date(2025, 7, 15),
      dataFim: new Date(2025, 7, 15),
      localizacao: "Sesc Teresópolis, varzea",
      preco: 50.0,
      disponibilidade: "Disponivel",
    });
    console.log('✅ Dados iniciais criados');
  }
};
seedData();
```

# 🚀 Deploy no Vercel

## Passo a Passo

### 1. Preparar o Projeto

✅ Já está pronto! Os arquivos necessários foram criados:
- `vercel.json` - Configuração do Vercel
- `.env.example` - Template de variáveis

### 2. Criar Conta no Vercel

1. Acesse: https://vercel.com
2. Clique em "Sign Up"
3. Conecte com GitHub

### 3. Fazer Deploy

**Opção A: Via GitHub (Recomendado)**

1. Suba o projeto no GitHub:
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

2. No Vercel:
   - Clique em "New Project"
   - Importe o repositório do GitHub
   - Configure as variáveis de ambiente
   - Clique em "Deploy"

**Opção B: Via CLI**

1. Instale o Vercel CLI:
```bash
npm i -g vercel
```

2. Faça login:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

### 4. Configurar Variáveis de Ambiente

No painel do Vercel, vá em:
- Settings → Environment Variables

Adicione:
```
MONGODB_URI = sua_connection_string_mongodb_atlas
JWT_SECRET = seu_secret_super_seguro_minimo_32_caracteres
JWT_EXPIRE = 7d
NODE_ENV = production
PORT = 3000
```

**IMPORTANTE:** Use MongoDB Atlas (não local)

### 5. MongoDB Atlas

1. Acesse: https://cloud.mongodb.com
2. Crie um cluster gratuito
3. Em "Network Access" → Adicione: `0.0.0.0/0` (permite Vercel)
4. Em "Database Access" → Crie um usuário
5. Copie a connection string

### 6. Testar

Após deploy, acesse:
```
https://seu-projeto.vercel.app
```

## ⚠️ Limitações do Vercel

- **Serverless Functions** - Cada requisição inicia uma nova instância
- **Timeout** - 10 segundos (plano gratuito)
- **Uploads** - Não persiste arquivos (use Cloudinary)
- **WebSockets** - Não suportado

## 🔧 Troubleshooting

### Erro: "Cannot find module"
- Verifique se todas as dependências estão no `package.json`
- Execute: `npm install` localmente

### Erro: "MongoDB connection failed"
- Verifique se o IP `0.0.0.0/0` está liberado no Atlas
- Confirme a connection string nas variáveis de ambiente

### Erro: "Function timeout"
- Otimize queries do MongoDB
- Adicione índices nas collections

## 📝 Comandos Úteis

```bash
# Deploy em produção
vercel --prod

# Ver logs
vercel logs

# Remover projeto
vercel remove
```

## 🎯 Próximos Passos

1. Configure domínio customizado
2. Ative Cloudinary para uploads
3. Configure CI/CD automático
4. Monitore com Vercel Analytics

## 🔗 Links Úteis

- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas](https://cloud.mongodb.com)
- [Cloudinary](https://cloudinary.com)

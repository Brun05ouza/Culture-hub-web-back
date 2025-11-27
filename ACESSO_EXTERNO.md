# Configuração para Acesso Externo

## Servidor Configurado ✅

O servidor já está configurado para aceitar conexões externas.

## Como Acessar

### 1. Inicie o servidor:
```bash
cd api
npm start
```

### 2. O servidor mostrará os endereços disponíveis:
```
✔️ Servidor rodando em:
   Local:    http://localhost:3000
   Rede:     http://192.168.x.x:3000
```

### 3. Acesso na Rede Local
- **Você (mesmo computador)**: http://localhost:3000
- **Outros dispositivos na mesma rede**: http://SEU_IP:3000

## Configuração do Firewall (Windows)

### Permitir porta 3000:
1. Abra o Painel de Controle
2. Windows Defender Firewall > Configurações Avançadas
3. Regras de Entrada > Nova Regra
4. Tipo: Porta
5. TCP, porta específica: 3000
6. Permitir conexão
7. Nome: "Culture Hub - Node.js"

### Ou via PowerShell (como Administrador):
```powershell
New-NetFirewallRule -DisplayName "Culture Hub" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

## Descobrir Seu IP

### Windows (CMD ou PowerShell):
```bash
ipconfig
```
Procure por "Endereço IPv4" na sua conexão ativa (Wi-Fi ou Ethernet)

### Exemplo:
```
Endereço IPv4: 192.168.1.100
```

## Acessar de Outros Dispositivos

1. Certifique-se que estão na mesma rede Wi-Fi
2. Use: http://192.168.1.100:3000 (substitua pelo seu IP)

## Acesso pela Internet (Opcional)

Para acesso externo à sua rede local:

### Opção 1: Redirecionamento de Porta (Port Forwarding)
1. Acesse seu roteador (geralmente 192.168.1.1)
2. Configure Port Forwarding:
   - Porta Externa: 3000
   - Porta Interna: 3000
   - IP: Seu IP local (ex: 192.168.1.100)
3. Descubra seu IP público: https://www.whatismyip.com
4. Acesse: http://SEU_IP_PUBLICO:3000

### Opção 2: Ngrok (Mais Fácil)
```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 3000
ngrok http 3000
```
Ngrok fornecerá uma URL pública temporária.

### Opção 3: Localtunnel
```bash
# Instalar
npm install -g localtunnel

# Expor porta 3000
lt --port 3000
```

## Variável de Ambiente (Opcional)

Para mudar a porta:
```bash
# Windows CMD
set PORT=8080 && npm start

# Windows PowerShell
$env:PORT=8080; npm start

# Linux/Mac
PORT=8080 npm start
```

## Segurança

⚠️ **IMPORTANTE**:
- Este servidor é para desenvolvimento/testes
- Para produção, use HTTPS
- Configure autenticação adequada
- Use variáveis de ambiente para dados sensíveis
- Considere usar um serviço de hospedagem profissional

## Troubleshooting

### Não consigo acessar de outro dispositivo:
1. ✅ Firewall configurado?
2. ✅ Mesma rede Wi-Fi?
3. ✅ IP correto?
4. ✅ Servidor rodando?

### Erro "EADDRINUSE":
- Porta 3000 já está em uso
- Feche outros servidores ou mude a porta

### Timeout/Não carrega:
- Verifique antivírus
- Desative VPN temporariamente
- Teste com `ping SEU_IP` de outro dispositivo

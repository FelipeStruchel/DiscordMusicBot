# 🚀 Guia de Deploy - VPS

Guia completo para fazer deploy do Tohsaka Rin Music Bot em uma VPS.

## 📋 Pré-requisitos da VPS

### **Sistema Operacional**
- Ubuntu 20.04+ (recomendado)
- Debian 11+
- CentOS 8+ (com algumas modificações)

### **Especificações Mínimas**
- **CPU**: 1 vCore
- **RAM**: 1GB
- **Storage**: 10GB
- **Rede**: Conexão estável

### **Especificações Recomendadas**
- **CPU**: 2 vCores
- **RAM**: 2GB
- **Storage**: 20GB SSD
- **Rede**: 100Mbps+

## 🛠️ Configuração da VPS

### **1. Atualizar o sistema**
```bash
sudo apt update && sudo apt upgrade -y
```

### **2. Instalar Node.js**
```bash
# Instalar Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

### **3. Instalar FFmpeg**
```bash
# Ubuntu/Debian
sudo apt install ffmpeg -y

# Verificar instalação
ffmpeg -version
```

### **4. Instalar Git**
```bash
sudo apt install git -y
```

### **5. Criar usuário para o bot (recomendado)**
```bash
# Criar usuário
sudo adduser botuser
sudo usermod -aG sudo botuser

# Trocar para o usuário
su - botuser
```

## 📦 Deploy do Projeto

### **1. Clonar o repositório**
```bash
# Navegar para pasta home
cd ~

# Clonar o projeto
git clone <seu-repositorio-url>
cd tohsaka-rin-music-bot
```

### **2. Instalar dependências**
```bash
# Instalar dependências
npm install

# Compilar o projeto
npm run build
```

### **3. Configurar variáveis de ambiente**
```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar configurações
nano .env
```

**Conteúdo do .env:**
```env
# Token do Bot do Discord
DISCORD_TOKEN=seu_token_aqui

# ID da Aplicação do Discord
DISCORD_APPLICATION_ID=seu_application_id_aqui

# Credenciais do Spotify (opcional)
SPOTIFY_CLIENT_ID=seu_spotify_client_id_aqui
SPOTIFY_CLIENT_SECRET=seu_spotify_client_secret_aqui
SPOTIFY_REFRESH_TOKEN=seu_spotify_refresh_token_aqui

# Configurações adicionais
COMMAND_PREFIX=!
MYMEMORY_EMAIL=seu_email_aqui
```

### **4. Testar o bot**
```bash
# Executar o bot
npm start
```

## 🔧 Configuração com PM2 (Produção)

### **1. Instalar PM2**
```bash
# Instalar PM2 globalmente
sudo npm install -g pm2
```

### **2. Criar arquivo de configuração do PM2**
```bash
# Criar arquivo ecosystem.config.js
nano ecosystem.config.js
```

**Conteúdo do ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'tohsaka-rin-bot',
    script: 'dist/index.js',
    cwd: '/home/botuser/tohsaka-rin-music-bot',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### **3. Criar pasta de logs**
```bash
mkdir logs
```

### **4. Iniciar com PM2**
```bash
# Iniciar o bot
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Configurar para iniciar com o sistema
pm2 startup
```

## 🔄 Scripts de Deploy

### **1. Script de deploy automático**
```bash
# Criar script deploy.sh
nano deploy.sh
```

**Conteúdo do deploy.sh:**
```bash
#!/bin/bash

echo "🚀 Iniciando deploy do Tohsaka Rin Bot..."

# Parar o bot
pm2 stop tohsaka-rin-bot

# Atualizar código
git pull origin main

# Instalar dependências
npm install

# Compilar
npm run build

# Reiniciar o bot
pm2 restart tohsaka-rin-bot

echo "✅ Deploy concluído!"
```

### **2. Tornar executável**
```bash
chmod +x deploy.sh
```

## 📊 Monitoramento

### **1. Comandos PM2 úteis**
```bash
# Ver status
pm2 status

# Ver logs
pm2 logs tohsaka-rin-bot

# Reiniciar
pm2 restart tohsaka-rin-bot

# Parar
pm2 stop tohsaka-rin-bot

# Iniciar
pm2 start tohsaka-rin-bot
```

### **2. Monitoramento de recursos**
```bash
# Ver uso de CPU e RAM
pm2 monit

# Ver estatísticas
pm2 show tohsaka-rin-bot
```

## 🔒 Segurança

### **1. Configurar firewall**
```bash
# Instalar UFW
sudo apt install ufw

# Configurar regras básicas
sudo ufw allow ssh
sudo ufw allow 22
sudo ufw enable
```

### **2. Atualizações automáticas**
```bash
# Instalar unattended-upgrades
sudo apt install unattended-upgrades

# Configurar
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 🚨 Troubleshooting

### **Problemas comuns:**

#### **1. Bot não inicia**
```bash
# Verificar logs
pm2 logs tohsaka-rin-bot

# Verificar se o .env está correto
cat .env

# Testar manualmente
node dist/index.js
```

#### **2. Erro de permissão**
```bash
# Corrigir permissões
sudo chown -R botuser:botuser /home/botuser/tohsaka-rin-music-bot
```

#### **3. FFmpeg não encontrado**
```bash
# Reinstalar FFmpeg
sudo apt remove ffmpeg
sudo apt install ffmpeg
```

#### **4. Node.js desatualizado**
```bash
# Atualizar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 📈 Otimizações

### **1. Otimizar uso de RAM**
```bash
# Ajustar heap size no ecosystem.config.js
node_args: '--max-old-space-size=512'
```

### **2. Backup automático**
```bash
# Criar script de backup
nano backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf backup_$DATE.tar.gz dist/ .env package.json
```

## 🎯 Checklist de Deploy

- [ ] VPS configurada com Node.js 18+
- [ ] FFmpeg instalado
- [ ] Repositório clonado
- [ ] Dependências instaladas
- [ ] Projeto compilado
- [ ] .env configurado
- [ ] PM2 instalado e configurado
- [ ] Bot iniciado e funcionando
- [ ] Logs verificados
- [ ] Firewall configurado

## 📞 Suporte

Se encontrar problemas durante o deploy:
1. Verifique os logs: `pm2 logs tohsaka-rin-bot`
2. Teste manualmente: `node dist/index.js`
3. Verifique as configurações no `.env`
4. Confirme se todas as dependências estão instaladas

---

**Deploy concluído! 🎉 O bot está rodando em produção.** 
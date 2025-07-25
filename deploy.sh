#!/bin/bash

echo "🚀 Iniciando deploy do Tohsaka Rin Bot..."

# Verificar se o PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 não está instalado. Instalando..."
    sudo npm install -g pm2
fi

# Parar o bot se estiver rodando
echo "⏹️ Parando o bot..."
pm2 stop tohsaka-rin-bot 2>/dev/null || true

# Atualizar código do repositório
echo "📥 Atualizando código..."
git pull origin main

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Compilar o projeto
echo "🔨 Compilando projeto..."
npm run build

# Criar pasta de logs se não existir
mkdir -p logs

# Iniciar o bot
echo "▶️ Iniciando o bot..."
pm2 start ecosystem.config.js

# Salvar configuração do PM2
echo "💾 Salvando configuração..."
pm2 save

echo "✅ Deploy concluído!"
echo "📊 Status do bot:"
pm2 status tohsaka-rin-bot 
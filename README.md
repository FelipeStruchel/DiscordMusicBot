# 🎵 Tohsaka Rin Music Bot

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

Um bot de música avançado para Discord desenvolvido em TypeScript, com suporte a YouTube e Spotify, sistema de fila inteligente e funcionalidades de moderação.

## ✨ Funcionalidades

### 🎵 **Sistema de Música**
- **Reprodução multi-plataforma**: YouTube e Spotify
- **Sistema de fila avançado** com controles completos
- **Controles de reprodução**: play, pause, resume, stop, skip
- **Controle de volume** (0-100%)
- **Saída automática** do canal quando a fila acaba
- **Suporte a múltiplos servidores** simultaneamente

### 🎨 **Interface e UX**
- **Embeds bonitos** do Discord com informações detalhadas
- **Thumbnails** das músicas
- **Formatação de duração** automática
- **Mensagens informativas** e feedback visual

### 🔧 **Funcionalidades Avançadas**
- **Sistema de aniversários** com notificações automáticas
- **Comandos de moderação**: nuke, clear
- **Comandos de informação**: serverinfo, userinfo
- **Comandos de entretenimento**: dice, roll, joke, yesno
- **Sistema de tradução** integrado
- **Comandos de utilidade**: ping, help

### 🛡️ **Sistema Anti-Detecção Avançado**
- **🎭 Simulação humana**: Headers aleatórios, delays, comportamento real
- **🔑 POTokens**: Geração automática de tokens de autenticação
- **🔄 Retry inteligente**: Tentativas com backoff exponencial
- **🌐 Rotação de IP**: Proxies dinâmicos do [free-proxy-list.net](https://free-proxy-list.net/pt)
- **📡 Monitoramento**: Verificação contínua da saúde da conexão
- **🛡️ Fallback robusto**: Múltiplas estratégias de recuperação
- **🔄 Atualização automática**: Busca novos proxies a cada inicialização

## 🛠️ Tecnologias Utilizadas

### **Backend**
- **TypeScript** - Linguagem principal com tipagem estática
- **Node.js** - Runtime JavaScript no servidor
- **Discord.js** - API oficial do Discord
- **SQLite** - Banco de dados relacional
- **Sequelize** - ORM para gerenciamento do banco

### **Reprodução de Mídia**
- **play-dl** - Biblioteca para reprodução de mídia
- **youtube-dl-exec** - Download e processamento de vídeos
- **@discordjs/voice** - Sistema de voz do Discord
- **FFmpeg** - Processamento de áudio

### **Sistema Anti-Detecção**
- **Puppeteer** - Geração de POTokens e cookies
- **axios** - Requisições HTTP com proxy
- **cheerio** - Parsing de HTML para busca de proxies
- **Proxies dinâmicos** - Busca automática do [free-proxy-list.net](https://free-proxy-list.net/pt)
- **Retry com backoff** - Recuperação inteligente de falhas

### **APIs Integradas**
- **Spotify Web API** - Reprodução de músicas do Spotify
- **YouTube Data API** - Busca e reprodução de vídeos
- **MyMemory API** - Sistema de tradução

## 🏗️ Arquitetura do Projeto

```
src/
├── commands/          # Comandos slash do Discord
│   ├── play.ts       # Reprodução de música
│   ├── queue.ts      # Gerenciamento de fila
│   ├── volume.ts     # Controle de volume
│   └── ...           # Outros comandos
├── managers/          # Gerenciadores principais
│   ├── MusicManager.ts    # Sistema de música
│   └── CommandManager.ts  # Gerenciamento de comandos
├── services/          # Serviços externos
│   ├── SpotifyService.ts      # Integração Spotify
│   ├── BirthdayService.ts     # Sistema de aniversários
│   └── TranslationService.ts  # Tradução
├── models/            # Modelos do banco de dados
│   └── Birthday.ts    # Modelo de aniversários
├── database/          # Configuração do banco
│   └── connection.ts  # Conexão SQLite
└── types/             # Definições de tipos
    └── discord.d.ts   # Extensões do Discord.js
```

## 🚀 Instalação e Configuração

### **Pré-requisitos**
- Node.js 16+ 
- npm ou yarn
- FFmpeg instalado no sistema
- Conta de desenvolvedor do Discord
- Conta de desenvolvedor do Spotify (opcional)

### **1. Clone o repositório**
```bash
git clone <seu-repositorio>
cd tohsaka-rin-music-bot
```

### **2. Instale as dependências**
```bash
npm install
```

### **3. Configure as variáveis de ambiente**
```bash
cp env.example .env
```

Edite o arquivo `.env` com suas credenciais:

### **4. Configuração de Proxies Dinâmicos (Opcional)**
O sistema busca proxies automaticamente do [free-proxy-list.net](https://free-proxy-list.net/pt). Configure no arquivo `vpn-config.json`:

```json
{
  "vpns": [
    {
      "type": "proxy",
      "config": "seu-proxy:porta",
      "country": "US",
      "server": "seu-proxy.com",
      "port": 8080
    }
  ],
  "settings": {
    "autoRotate": true,
    "rotationInterval": 15,
    "maxFailuresBeforeRotation": 3,
    "enableVPN": true,
    "enableProxy": true,
    "dynamicProxyFetch": true,
    "preferredCountries": ["US", "NL", "DE", "GB", "CA", "AU"],
    "maxProxyAge": 60,
    "testProxies": true
  }
}
```

**Comandos disponíveis:**
- `/proxy refresh` - Atualiza lista de proxies
- `/proxy stats` - Mostra estatísticas
- `/proxy current` - Mostra proxy atual

**Nota**: O sistema é **totalmente automático** e busca novos proxies a cada inicialização.

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

### **4. Compile o projeto**
```bash
npm run build
```

### **5. Execute o bot**
```bash
npm start
```

## 🔧 Configuração do Bot

### **1. Criar Bot no Discord**
1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Crie uma nova aplicação
3. Vá para a seção "Bot"
4. Copie o **Token** e cole no `.env`

### **2. Configurar Permissões**
1. Na seção "OAuth2" > "URL Generator"
2. Selecione os escopos: `bot` e `applications.commands`
3. Selecione as permissões necessárias:
   - Send Messages
   - Use Slash Commands
   - Connect
   - Speak
   - Use Voice Activity
4. Use a URL gerada para convidar o bot

### **3. Configurar Spotify (Opcional)**
1. Acesse [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Crie uma nova aplicação
3. Copie o **Client ID** e **Client Secret**
4. Cole no arquivo `.env`

## 📝 Comandos Disponíveis

### **🎵 Comandos de Música**
| Comando | Descrição | Uso |
|---------|-----------|-----|
| `/play` | Tocar música | `/play query:música ou URL` |
| `/pause` | Pausar música | `/pause` |
| `/resume` | Retomar música | `/resume` |
| `/stop` | Parar música | `/stop` |
| `/skip` | Pular música | `/skip` |
| `/queue` | Ver fila | `/queue` |
| `/volume` | Ajustar volume | `/volume level:50` |

### **🔧 Comandos de Moderação**
| Comando | Descrição | Uso |
|---------|-----------|-----|
| `/nuke` | Deletar e recriar canal | `/nuke` |
| `/clear` | Limpar mensagens | `/clear` |

### **ℹ️ Comandos de Informação**
| Comando | Descrição | Uso |
|---------|-----------|-----|
| `/serverinfo` | Info do servidor | `/serverinfo` |
| `/userinfo` | Info do usuário | `/userinfo` |
| `/ping` | Latência do bot | `/ping` |
| `/proxy` | Gerencia proxies dinâmicos | `/proxy refresh/stats/current` |

### **🎲 Comandos de Entretenimento**
| Comando | Descrição | Uso |
|---------|-----------|-----|
| `/dice` | Rolar dados | `/dice` |
| `/roll` | Rolar dados | `/roll` |
| `/joke` | Contar piada | `/joke` |
| `/yesno` | Pergunta sim/não | `/yesno` |

## 🎵 Suporte a Plataformas

### **YouTube**
- ✅ URLs diretas de vídeos
- ✅ URLs de playlists
- ✅ Busca por nome de música
- ✅ Conversão automática de formatos

### **Spotify**
- ✅ URLs de músicas individuais
- ✅ Integração com API oficial
- ✅ Busca automática no YouTube para reprodução
- ✅ Informações detalhadas da música

## 🛠️ Desenvolvimento

### **Scripts disponíveis**
```bash
# Desenvolvimento com hot reload
npm run dev

# Compilar TypeScript
npm run build

# Executar em produção
npm start

# Executar com watch mode
npm run watch
```

### **Estrutura de Desenvolvimento**
- **TypeScript** com configuração rigorosa
- **ESLint** para qualidade de código
- **Modularização** para fácil manutenção
- **Error handling** robusto
- **Logs estruturados** para debugging

## 📊 Métricas do Projeto

- **~1000 linhas** de código TypeScript
- **15+ comandos** implementados
- **3+ serviços** externos integrados
- **100% tipado** com TypeScript
- **Arquitetura modular** e escalável
- **Suporte multi-servidor** simultâneo

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 Agradecimentos

- [Discord.js](https://discord.js.org/) - Biblioteca do Discord
- [play-dl](https://github.com/play-dl/play-dl) - Biblioteca de reprodução
- [@discordjs/voice](https://github.com/discordjs/voice) - Sistema de voz
- [Sequelize](https://sequelize.org/) - ORM para Node.js

## 🐛 Problemas Conhecidos

- Algumas músicas do Spotify podem não funcionar devido a restrições regionais
- Playlists muito grandes podem causar timeouts
- Volume muito alto pode causar distorção

## 📞 Suporte

Se você encontrar algum problema ou tiver sugestões, abra uma issue no GitHub.

---

**Desenvolvido com ❤️ por Felipe Struchel**

*Um bot de música Discord avançado, construído com TypeScript e arquitetura moderna.* 

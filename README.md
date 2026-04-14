# Tohsaka Rin

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org/)

Bot do Discord desenvolvido em TypeScript.

## Funcionalidades

- **Música** via Lavalink
- **Moderação**: nuke, clear
- **Informação**: serverinfo, userinfo, ping
- **Entretenimento**: dice, roll, joke, yesno
- **Tradução**: translate, detect

## Estrutura

```
src/
├── commands/          # Comandos slash
├── services/          # Serviços externos
│   └── TranslationService.ts
└── types/             # Definições de tipos
```

## Instalação

```bash
npm install
```

Configure o arquivo `.env`:

```env
DISCORD_TOKEN=seu_token_aqui
DISCORD_APPLICATION_ID=seu_application_id_aqui
MYMEMORY_EMAIL=seu_email_aqui
```

```bash
npm run build
npm start
```

## Comandos

### Música
| Comando | Descrição |
|---------|-----------|
| `/play` | Tocar música |
| `/pause` | Pausar música |
| `/resume` | Retomar música |
| `/stop` | Parar música |
| `/skip` | Pular música |
| `/queue` | Ver fila |
| `/volume` | Ajustar volume |

### Moderação
| Comando | Descrição |
|---------|-----------|
| `/nuke` | Deletar e recriar canal |
| `/clear` | Limpar mensagens |

### Informação
| Comando | Descrição |
|---------|-----------|
| `/serverinfo` | Info do servidor |
| `/userinfo` | Info do usuário |
| `/ping` | Latência do bot |

### Entretenimento
| Comando | Descrição |
|---------|-----------|
| `/dice` | Rolar dados |
| `/roll` | Rolagem personalizada |
| `/joke` | Contar piada |
| `/yesno` | Pergunta sim/não |
| `/translate` | Traduzir texto |
| `/detect` | Detectar idioma |

## Scripts

```bash
npm run dev    # Desenvolvimento
npm run build  # Compilar
npm start      # Produção
```

---

**Desenvolvido por Felipe Struchel**

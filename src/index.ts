import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { join } from 'path';
import { readdirSync } from 'fs';
import { MusicManager } from './managers/MusicManager';
import { initializeDatabase } from './database/connection';
import { BirthdayNotificationService } from './services/BirthdayNotificationService';
import { initializeTokenGenerator, cleanupTokenGenerator } from './utils/tokenGenerator';
import play from 'play-dl';

// Carregar variáveis de ambiente
config();

// Configurar play-dl para Spotify
async function setupPlayDl() {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
    
    if (clientId && clientSecret) {
      const spotifyConfig: any = {
        client_id: clientId,
        client_secret: clientSecret,
        market: 'BR'
      };
      
      if (refreshToken) {
        spotifyConfig.refresh_token = refreshToken;
      }
      
      await play.setToken({
        spotify: spotifyConfig
      });
      console.log('✅ Spotify configurado no play-dl');
    } else {
      console.log('⚠️ Credenciais do Spotify não encontradas, funcionalidade limitada');
    }
  } catch (error) {
    console.error('❌ Erro ao configurar Spotify no play-dl:', error);
  }
}

// Configurar o cliente do Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Coleções para comandos e aliases
client.commands = new Collection();
client.aliases = new Collection();

// Inicializar gerenciadores
const musicManager = new MusicManager(client);

// Instanciar o serviço de notificação de aniversários
const birthdayNotificationService = new BirthdayNotificationService(client);

// Adicionar o serviço ao cliente para acesso global
(client as any).birthdayNotificationService = birthdayNotificationService;

// Evento de ready
client.once('ready', async () => {
  console.log(`🎵 ${client.user?.tag} está online e pronto para tocar música!`);
  client.user?.setActivity('🎵 música | !help', { type: 2 }); // 2 = Listening
  
  // Configurar play-dl
  await setupPlayDl();
  
  // Inicializar banco de dados
  await initializeDatabase();
  
  // Iniciar serviço de notificação de aniversários
  birthdayNotificationService.start();
  
  // Inicializar gerador de tokens
  await initializeTokenGenerator();
  
  // Registrar comandos slash
  await registerCommands();
});

// Evento de desconexão
client.on('disconnect', () => {
  console.log('Bot desconectado, limpando recursos...');
  musicManager.destroy();
  birthdayNotificationService.stop();
  cleanupTokenGenerator();
});

// Evento de erro
client.on('error', (error) => {
  console.error('Erro no cliente Discord:', error);
});

// Tratamento de sinais para desligamento limpo
process.on('SIGINT', () => {
  console.log('Desligando bot...');
  musicManager.destroy();
  birthdayNotificationService.stop();
  cleanupTokenGenerator();
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Desligando bot...');
  musicManager.destroy();
  birthdayNotificationService.stop();
  client.destroy();
  process.exit(0);
});

// Evento de interação (comandos slash)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, musicManager);
  } catch (error) {
    console.error(error);
    const errorMessage = 'Houve um erro ao executar este comando!';
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
});

// Evento de mensagem (comandos com prefixo)
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  const prefix = process.env.COMMAND_PREFIX || '!';
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName) return;

  // Mapear comandos com prefixo para comandos slash
  const commandMap: { [key: string]: string } = {
    'play': 'play',
    'pausar': 'pause',
    'pause': 'pause',
    'resume': 'resume',
    'retomar': 'resume',
    'stop': 'stop',
    'parar': 'stop',
    'skip': 'skip',
    'pular': 'skip',
    'queue': 'queue',
    'fila': 'queue',
    'volume': 'volume',
    'nuke': 'nuke',
    'clear': 'clear',
    'limpar': 'clear',
    'serverinfo': 'serverinfo',
    'servidor': 'serverinfo',
    'userinfo': 'userinfo',
    'usuario': 'userinfo',
    'ping': 'ping',
    'roll': 'roll',
    'dice': 'dice',
    'dados': 'dice',
    'help': 'help',
    'ajuda': 'help'
  };

  const slashCommandName = commandMap[commandName];
  if (!slashCommandName) return;

  const command = client.commands.get(slashCommandName);
  if (!command) return;

  try {
    // Criar uma interação simulada para comandos com prefixo
    const mockInteraction = {
      ...message,
      isCommand: () => true,
      commandName: slashCommandName,
      channel: message.channel,
      options: {
        getString: (name: string) => {
          if (name === 'query') return args.join(' ');
          if (name === 'level') return parseInt(args[0]) || 50;
          if (name === 'dados') return args.join(' ');
          if (name === 'descricao') return args.slice(1).join(' ');
          return null;
        },
        getInteger: (name: string) => {
          if (name === 'level') return parseInt(args[0]) || 50;
          if (name === 'volume') return parseInt(args[0]) || 50;
          if (name === 'quantidade') return parseInt(args[0]) || 1;
          return null;
        },
        getUser: (name: string) => {
          if (name === 'usuario') {
            const userMention = args[0];
            if (userMention) {
              const userId = userMention.replace(/[<@!>]/g, '');
              return client.users.cache.get(userId) || null;
            }
          }
          return null;
        }
      },
      reply: async (content: any) => {
        await message.channel.send(content);
      },
      editReply: async (content: any) => {
        // Para comandos com prefixo, usar send em vez de reply
        await message.channel.send(content);
      },
      deferReply: async (options?: any) => {
        // Simular deferReply
      },
      followUp: async (content: any) => {
        await message.reply(content);
      },
      user: message.author,
      member: message.member,
      guildId: message.guild?.id,
      replied: false,
      deferred: false
    };

    await command.execute(mockInteraction as any, musicManager);
  } catch (error) {
    console.error(error);
    await message.reply('❌ Houve um erro ao executar este comando!');
  }
});

// Carregar comandos
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  }
}

// Função para registrar comandos slash
async function registerCommands() {
  
  const commands = [
    // Comandos de Música
    {
      name: 'play',
      description: 'Reproduz uma música do YouTube ou Spotify',
      options: [
        {
          name: 'query',
          description: 'URL ou nome da música',
          type: 3, // STRING
          required: true
        }
      ]
    },
    {
      name: 'pause',
      description: 'Pausa a música atual'
    },
    {
      name: 'resume',
      description: 'Retoma a música pausada'
    },
    {
      name: 'stop',
      description: 'Para a reprodução e limpa a fila'
    },
    {
      name: 'skip',
      description: 'Pula para a próxima música'
    },
    {
      name: 'queue',
      description: 'Mostra a fila de músicas atual'
    },
    {
      name: 'volume',
      description: 'Ajusta o volume da música',
      options: [
        {
          name: 'volume',
          description: 'Volume (0-100)',
          type: 4, // INTEGER
          required: true,
          min_value: 0,
          max_value: 100
        }
      ]
    },
    // Comandos de Moderação
    {
      name: 'nuke',
      description: 'Deleta e recria o canal atual para limpar todas as mensagens'
    },
    {
      name: 'clear',
      description: 'Deleta um número específico de mensagens',
      options: [
        {
          name: 'quantidade',
          description: 'Número de mensagens para deletar (1-100)',
          type: 4, // INTEGER
          required: true,
          min_value: 1,
          max_value: 100
        }
      ]
    },
    // Comandos de Dados
    {
      name: 'roll',
      description: 'Rola dados para RPG ou jogos',
      options: [
        {
          name: 'dados',
          description: 'Formato dos dados (ex: 1d20, 2d6, 3d10+5)',
          type: 3, // STRING
          required: true
        },
        {
          name: 'descricao',
          description: 'Descrição da rolagem (opcional)',
          type: 3, // STRING
          required: false
        }
      ]
    },
    {
      name: 'dice',
      description: 'Rola dados comuns rapidamente',
      options: [
        {
          name: 'tipo',
          description: 'Tipo de dado',
          type: 3, // STRING
          required: true,
          choices: [
            { name: 'd4', value: 'd4' },
            { name: 'd6', value: 'd6' },
            { name: 'd8', value: 'd8' },
            { name: 'd10', value: 'd10' },
            { name: 'd12', value: 'd12' },
            { name: 'd20', value: 'd20' },
            { name: 'd100', value: 'd100' }
          ]
        },
        {
          name: 'quantidade',
          description: 'Quantidade de dados (1-10)',
          type: 4, // INTEGER
          required: false,
          min_value: 1,
          max_value: 10
        }
      ]
    },
    {
      name: 'yesno',
      description: 'Responde sua pergunta com sim ou não',
      options: [
        {
          name: 'pergunta',
          description: 'Sua pergunta (ex: Vou ganhar na loteria?)',
          type: 3, // STRING
          required: true
        }
      ]
    },
    // Comandos de Tradução
    {
      name: 'translate',
      description: 'Traduz texto entre idiomas',
      options: [
        {
          name: 'texto',
          description: 'Texto para traduzir',
          type: 3, // STRING
          required: true
        },
        {
          name: 'para',
          description: 'Idioma de destino',
          type: 3, // STRING
          required: true,
          choices: [
            { name: '🇺🇸 Inglês', value: 'en' },
            { name: '🇧🇷 Português', value: 'pt' },
            { name: '🇪🇸 Espanhol', value: 'es' },
            { name: '🇫🇷 Francês', value: 'fr' },
            { name: '🇩🇪 Alemão', value: 'de' },
            { name: '🇮🇹 Italiano', value: 'it' },
            { name: '🇷🇺 Russo', value: 'ru' },
            { name: '🇯🇵 Japonês', value: 'ja' },
            { name: '🇰🇷 Coreano', value: 'ko' },
            { name: '🇨🇳 Chinês', value: 'zh' },
            { name: '🇸🇦 Árabe', value: 'ar' },
            { name: '🇮🇳 Hindi', value: 'hi' }
          ]
        },
        {
          name: 'de',
          description: 'Idioma de origem (deixe em branco para auto-detectar)',
          type: 3, // STRING
          required: false,
          choices: [
            { name: '🔍 Auto-detectar', value: 'auto' },
            { name: '🇺🇸 Inglês', value: 'en' },
            { name: '🇧🇷 Português', value: 'pt' },
            { name: '🇪🇸 Espanhol', value: 'es' },
            { name: '🇫🇷 Francês', value: 'fr' },
            { name: '🇩🇪 Alemão', value: 'de' },
            { name: '🇮🇹 Italiano', value: 'it' },
            { name: '🇷🇺 Russo', value: 'ru' },
            { name: '🇯🇵 Japonês', value: 'ja' },
            { name: '🇰🇷 Coreano', value: 'ko' },
            { name: '🇨🇳 Chinês', value: 'zh' },
            { name: '🇸🇦 Árabe', value: 'ar' },
            { name: '🇮🇳 Hindi', value: 'hi' }
          ]
        }
      ]
    },
    {
      name: 'detect',
      description: 'Detecta o idioma de um texto',
      options: [
        {
          name: 'texto',
          description: 'Texto para detectar o idioma',
          type: 3, // STRING
          required: true
        }
      ]
    },
    // Comandos de Entretenimento
    {
      name: 'joke',
      description: 'Conta uma piada de pai e traduz automaticamente',
      options: [
        {
          name: 'idioma',
          description: 'Idioma para traduzir a piada (padrão: português)',
          type: 3, // STRING
          required: false,
          choices: [
            { name: '🇧🇷 Português', value: 'pt' },
            { name: '🇺🇸 Inglês (original)', value: 'en' },
            { name: '🇪🇸 Espanhol', value: 'es' },
            { name: '🇫🇷 Francês', value: 'fr' },
            { name: '🇩🇪 Alemão', value: 'de' },
            { name: '🇮🇹 Italiano', value: 'it' }
          ]
        }
      ]
    },
    // Comandos de Aniversário
    {
      name: 'birthday',
      description: 'Gerencia aniversários',
      options: [
        {
          name: 'add',
          description: 'Adiciona ou atualiza seu aniversário',
          type: 1, // SUB_COMMAND
          options: [
            {
              name: 'dia',
              description: 'Dia do aniversário (1-31)',
              type: 4, // INTEGER
              required: true,
              min_value: 1,
              max_value: 31
            },
            {
              name: 'mes',
              description: 'Mês do aniversário (1-12)',
              type: 4, // INTEGER
              required: true,
              min_value: 1,
              max_value: 12
            },
            {
              name: 'ano',
              description: 'Ano de nascimento (opcional)',
              type: 4, // INTEGER
              required: false,
              min_value: 1900,
              max_value: new Date().getFullYear()
            }
          ]
        },
        {
          name: 'remove',
          description: 'Remove seu aniversário',
          type: 1 // SUB_COMMAND
        },
        {
          name: 'list',
          description: 'Lista todos os aniversários do servidor',
          type: 1 // SUB_COMMAND
        },
        {
          name: 'today',
          description: 'Mostra aniversários de hoje',
          type: 1 // SUB_COMMAND
        },
        {
          name: 'upcoming',
          description: 'Mostra próximos aniversários',
          type: 1, // SUB_COMMAND
          options: [
            {
              name: 'dias',
              description: 'Número de dias para verificar (1-90)',
              type: 4, // INTEGER
              required: false,
              min_value: 1,
              max_value: 90
            }
          ]
        }
      ]
    },
    {
      name: 'testbirthday',
      description: 'Testa o sistema de notificação de aniversários (apenas para administradores)'
    },
    // Comandos de Informação
    {
      name: 'serverinfo',
      description: 'Mostra informações sobre o servidor'
    },
    {
      name: 'userinfo',
      description: 'Mostra informações sobre um usuário',
      options: [
        {
          name: 'usuario',
          description: 'Usuário para mostrar informações (opcional)',
          type: 6, // USER
          required: false
        }
      ]
    },
    {
      name: 'ping',
      description: 'Mostra a latência do bot'
    },
    {
      name: 'help',
      description: 'Mostra todos os comandos disponíveis'
    }
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

  try {
    console.log('🔄 Registrando comandos slash...');
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID!),
      { body: commands },
    );
    await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_APPLICATION_ID!, '920107884069679156'),
      { body: commands },
    );

    console.log('✅ Comandos slash registrados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao registrar comandos:', error);
  }
}

// Login do bot
client.login(process.env.DISCORD_TOKEN); 
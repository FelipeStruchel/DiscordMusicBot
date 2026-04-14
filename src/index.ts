import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { join } from 'path';
import { readdirSync } from 'fs';

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
client.aliases = new Collection();

client.once('ready', async () => {
  console.log(`🎵 ${client.user?.tag} está online!`);
  client.user?.setActivity('🎵 música | /help', { type: 2 }); // 2 = Listening

  await registerCommands();
});

client.on('error', (error) => {
  console.error('Erro no cliente Discord:', error);
});

process.on('SIGINT', () => {
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  client.destroy();
  process.exit(0);
});

// Evento de interação (comandos slash)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
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

async function registerCommands() {
  const commands = [
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
          type: 4,
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
          type: 3,
          required: true
        },
        {
          name: 'descricao',
          description: 'Descrição da rolagem (opcional)',
          type: 3,
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
          type: 3,
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
          type: 4,
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
          type: 3,
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
          type: 3,
          required: true
        },
        {
          name: 'para',
          description: 'Idioma de destino',
          type: 3,
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
          type: 3,
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
          type: 3,
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
          type: 3,
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
          type: 6,
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

client.login(process.env.DISCORD_TOKEN);

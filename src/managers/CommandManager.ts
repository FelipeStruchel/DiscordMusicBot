import { Client, REST, Routes, SlashCommandBuilder } from 'discord.js';

export class CommandManager {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  // Registrar comandos slash
  async registerCommands(): Promise<void> {
    const commands = [
      new SlashCommandBuilder()
        .setName('play')
        .setDescription('Tocar uma música do YouTube ou Spotify')
        .addStringOption(option =>
          option.setName('query')
            .setDescription('URL ou nome da música')
            .setRequired(true)),
      
      new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pausar a música atual'),
      
      new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Retomar a música pausada'),
      
      new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Parar a música e limpar a fila'),
      
      new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Pular para a próxima música'),
      
      new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Mostrar a fila de músicas'),
      
      new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Ajustar o volume (0-100)')
        .addIntegerOption(option =>
          option.setName('level')
            .setDescription('Nível do volume (0-100)')
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(100)),
      
      new SlashCommandBuilder()
        .setName('help')
        .setDescription('Mostrar ajuda sobre os comandos'),
    ];

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

    try {
      console.log('Registrando comandos slash...');

      await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
        { body: commands },
      );

      console.log('Comandos slash registrados com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar comandos:', error);
    }
  }
} 
import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';
import { MusicManager } from '../managers/MusicManager';

export const data = new SlashCommandBuilder()
  .setName('volume')
  .setDescription('Ajusta o volume da música')
  .addIntegerOption(option =>
    option.setName('volume')
      .setDescription('Volume (0-100)')
      .setRequired(true)
      .setMinValue(0)
      .setMaxValue(100)
  );

export async function execute(interaction: CommandInteraction, musicManager: MusicManager) {
  await interaction.deferReply();

  const guildId = interaction.guildId!;
  const volume = (interaction as any).options.getInteger('volume')!;

  if (!musicManager.isPlaying(guildId)) {
    return interaction.editReply('❌ Não há música tocando no momento!');
  }

  musicManager.setVolume(guildId, volume);
  
  const embed = new EmbedBuilder()
    .setColor('#00ff00')
    .setTitle('🔊 Volume Ajustado')
    .setDescription(`Volume definido para **${volume}%**`)
    .setTimestamp();

  return interaction.editReply({ embeds: [embed] });
} 
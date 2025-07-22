import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';
import { MusicManager } from '../managers/MusicManager';

export const data = new SlashCommandBuilder()
  .setName('stop')
  .setDescription('Para a reprodução e limpa a fila');

export async function execute(interaction: CommandInteraction, musicManager: MusicManager) {
  await interaction.deferReply();

  const guildId = interaction.guildId!;
  
  if (!musicManager.isPlaying(guildId)) {
    return interaction.editReply('❌ Não há música tocando no momento!');
  }

  musicManager.stop(guildId);
  
  const embed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle('⏹️ Reprodução Parada')
    .setDescription('A reprodução foi parada e a fila foi limpa.')
    .setTimestamp();

  return interaction.editReply({ embeds: [embed] });
} 
import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';
import { MusicManager } from '../managers/MusicManager';

export const data = new SlashCommandBuilder()
  .setName('resume')
  .setDescription('Retoma a música pausada');

export async function execute(interaction: CommandInteraction, musicManager: MusicManager) {
  await interaction.deferReply();

  const guildId = interaction.guildId!;
  
  if (!musicManager.isPlaying(guildId)) {
    return interaction.editReply('❌ Não há música tocando no momento!');
  }

  const success = musicManager.resume(guildId);
  
  if (success) {
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('▶️ Música Retomada')
      .setDescription('A música foi retomada com sucesso!')
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } else {
    return interaction.editReply('❌ Erro ao retomar a música!');
  }
} 
import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';
import { MusicManager } from '../managers/MusicManager';

export const data = new SlashCommandBuilder()
  .setName('skip')
  .setDescription('Pula para a próxima música');

export async function execute(interaction: CommandInteraction, musicManager: MusicManager) {
  await interaction.deferReply();

  const guildId = interaction.guildId!;
  
  if (!musicManager.isPlaying(guildId)) {
    return interaction.editReply('❌ Não há música tocando no momento!');
  }

  const success = musicManager.skip(guildId);
  
  if (success) {
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('⏭️ Música Pulada')
      .setDescription('Pulando para a próxima música...')
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } else {
    return interaction.editReply('❌ Erro ao pular a música!');
  }
} 
import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';
import { MusicManager } from '../managers/MusicManager';

export const data = new SlashCommandBuilder()
  .setName('pause')
  .setDescription('Pausa a música atual');

export async function execute(interaction: CommandInteraction, musicManager: MusicManager) {
  await interaction.deferReply();

  const guildId = interaction.guildId!;
  
  if (!musicManager.isPlaying(guildId)) {
    return interaction.editReply('❌ Não há música tocando no momento!');
  }

  const success = musicManager.pause(guildId);
  
  if (success) {
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('⏸️ Música Pausada')
      .setDescription('A música foi pausada com sucesso!')
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } else {
    return interaction.editReply('❌ Erro ao pausar a música!');
  }
} 
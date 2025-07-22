import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';
import { MusicManager } from '../managers/MusicManager';

export const data = new SlashCommandBuilder()
  .setName('queue')
  .setDescription('Mostra a fila de músicas atual');

export async function execute(interaction: CommandInteraction, musicManager: MusicManager) {
  await interaction.deferReply();

  const guildId = interaction.guildId!;
  const queue = musicManager.getCurrentQueue(guildId);
  const isPlaying = musicManager.isPlaying(guildId);
  const volume = musicManager.getVolume(guildId);

  if (queue.length === 0 && !isPlaying) {
    return interaction.editReply('❌ Não há músicas na fila!');
  }

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('📋 Fila de Músicas')
    .setDescription(`Volume: ${volume}%`)
    .setTimestamp();

  if (isPlaying) {
    embed.addFields({
      name: '🎵 Tocando Agora',
      value: 'Música atual está tocando...',
      inline: false
    });
  }

  if (queue.length > 0) {
    const queueList = queue.slice(0, 10).map((song, index) => 
      `${index + 1}. **${song.title}** - ${song.requestedBy}`
    ).join('\n');

    embed.addFields({
      name: `📝 Próximas Músicas (${queue.length})`,
      value: queueList,
      inline: false
    });

    if (queue.length > 10) {
      embed.setFooter({ text: `E mais ${queue.length - 10} músicas...` });
    }
  }

  return interaction.editReply({ embeds: [embed] });
} 
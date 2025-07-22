import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Mostra a latência do bot');

export async function execute(interaction: CommandInteraction) {
  const sent = await interaction.reply({ content: '🏓 Pong!', fetchReply: true });
  const latency = sent.createdTimestamp - interaction.createdTimestamp;

  const embed = new EmbedBuilder()
    .setColor('#00ff00')
    .setTitle('🏓 Pong!')
    .addFields(
      { name: '📡 Latência', value: `${latency}ms`, inline: true },
      { name: '🌐 API Latency', value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true }
    )
    .setTimestamp();

  await interaction.editReply({ content: '', embeds: [embed] });
} 
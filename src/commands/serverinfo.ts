import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('serverinfo')
  .setDescription('Mostra informações sobre o servidor');

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply();

  const guild = interaction.guild;
  if (!guild) {
    return interaction.editReply('❌ Este comando só pode ser usado em servidores!');
  }

  const owner = await guild.fetchOwner();
  const memberCount = guild.memberCount;
  const channelCount = guild.channels.cache.size;
  const roleCount = guild.roles.cache.size;
  const emojiCount = guild.emojis.cache.size;
  const boostLevel = guild.premiumTier;
  const boostCount = guild.premiumSubscriptionCount || 0;

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`📊 Informações do Servidor`)
    .setThumbnail(guild.iconURL({ size: 256 }))
    .addFields(
      { name: '🏷️ Nome', value: guild.name, inline: true },
      { name: '👑 Dono', value: owner.user.tag, inline: true },
      { name: '🆔 ID', value: guild.id, inline: true },
      { name: '👥 Membros', value: memberCount.toString(), inline: true },
      { name: '📺 Canais', value: channelCount.toString(), inline: true },
      { name: '🎭 Cargos', value: roleCount.toString(), inline: true },
      { name: '😀 Emojis', value: emojiCount.toString(), inline: true },
      { name: '🚀 Boost Level', value: `Nível ${boostLevel}`, inline: true },
      { name: '💎 Boosts', value: boostCount.toString(), inline: true },
      { name: '📅 Criado em', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false }
    )
    .setTimestamp();

  if (guild.description) {
    embed.addFields({ name: '📝 Descrição', value: guild.description, inline: false });
  }

  return interaction.editReply({ embeds: [embed] });
} 
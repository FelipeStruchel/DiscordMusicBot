import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Mostra informações sobre um usuário')
  .addUserOption(option =>
    option.setName('usuario')
      .setDescription('Usuário para mostrar informações (opcional)')
      .setRequired(false)
  );

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply();

  const targetUser = (interaction as any).options.getUser('usuario') || interaction.user;
  const guild = interaction.guild;
  
  if (!guild) {
    return interaction.editReply('❌ Este comando só pode ser usado em servidores!');
  }

  const member = await guild.members.fetch(targetUser.id);
  const roles = member.roles.cache
    .filter(role => role.id !== guild.id)
    .sort((a, b) => b.position - a.position)
    .map(role => role.name)
    .slice(0, 10);

  const embed = new EmbedBuilder()
    .setColor(member.displayHexColor)
    .setTitle(`👤 Informações do Usuário`)
    .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: '🏷️ Nome', value: targetUser.tag, inline: true },
      { name: '🆔 ID', value: targetUser.id, inline: true },
      { name: '📅 Conta criada', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>`, inline: true },
      { name: '📥 Entrou em', value: `<t:${Math.floor(member.joinedTimestamp! / 1000)}:F>`, inline: true },
      { name: '🎭 Cargo mais alto', value: member.roles.highest.name, inline: true },
      { name: '🎨 Cor', value: member.displayHexColor, inline: true },
      { name: '🎭 Cargos', value: roles.length > 0 ? roles.join(', ') : 'Nenhum cargo', inline: false }
    )
    .setTimestamp();

  if (member.nickname) {
    embed.addFields({ name: '📝 Apelido', value: member.nickname, inline: true });
  }

  if (member.permissions.has('Administrator')) {
    embed.addFields({ name: '👑 Permissões', value: 'Administrador', inline: true });
  }

  return interaction.editReply({ embeds: [embed] });
} 
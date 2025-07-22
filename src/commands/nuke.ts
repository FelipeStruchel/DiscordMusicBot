import { SlashCommandBuilder, CommandInteraction, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('nuke')
  .setDescription('Deleta e recria o canal atual para limpar todas as mensagens')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply();

  const channel = interaction.channel;
  
  if (!channel || !('guild' in channel) || !('type' in channel)) {
    return interaction.editReply('❌ Este comando só pode ser usado em canais de servidor!');
  }

  try {
    // Salvar informações do canal
    const channelName = channel.name;
    const channelType = channel.type;
    const channelParent = channel.parent;
    
    // Verificar se é um canal de texto
    if (channel.type !== 0) { // 0 = GuildText
      return interaction.editReply('❌ Este comando só pode ser usado em canais de texto!');
    }

    // Deletar o canal
    await channel.delete();
    console.log(`Canal ${channelName} foi nukado por ${interaction.user.tag}`);

    // Recriar o canal
    const newChannel = await channel.guild.channels.create({
      name: channelName,
      type: 0, // GuildText
      parent: channelParent?.id
    });

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('💥 Canal Nukado!')
      .setDescription(`Canal **${channelName}** foi recriado com sucesso!`)
      .addFields(
        { name: '👤 Executado por', value: interaction.user.tag, inline: true },
        { name: '📊 Mensagens deletadas', value: 'Todas as mensagens foram removidas', inline: true }
      )
      .setTimestamp();

    await newChannel.send({ embeds: [embed] });

  } catch (error) {
    console.error('Erro ao nukar canal:', error);
    return interaction.editReply('❌ Erro ao executar o comando nuke!');
  }
} 
import { SlashCommandBuilder, CommandInteraction, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('clear')
  .setDescription('Deleta um número específico de mensagens')
  .addIntegerOption(option =>
    option.setName('quantidade')
      .setDescription('Número de mensagens para deletar (1-100)')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(100)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export async function execute(interaction: CommandInteraction) {
  // Detectar se é um comando com prefixo (tem propriedade reply)
  const isPrefixCommand = 'reply' in interaction && typeof (interaction as any).reply === 'function';
  
  if (!isPrefixCommand) {
    await interaction.deferReply({ ephemeral: true });
  }

  const channel = interaction.channel;
  const amount = (interaction as any).options.getInteger('quantidade')!;

  // Função para responder
  const respond = async (content: any) => {
    if (isPrefixCommand) {
      return (interaction as any).reply(content);
    } else {
      return interaction.editReply(content);
    }
  };

  // Verificar se é um canal de texto de várias formas
  if (!channel) {
    return respond('❌ Canal não encontrado!');
  }

  // Para comandos com prefixo, o canal pode vir de forma diferente
  const textChannel = 'type' in channel ? channel : (interaction as any).channel;
  
  if (!textChannel || (textChannel.type !== 0 && textChannel.type !== undefined)) {
    return respond('❌ Este comando só pode ser usado em canais de texto!');
  }

  try {
    // Buscar mensagens (limitando a 14 dias para evitar erros)
    const messages = await textChannel.messages.fetch({ limit: Math.min(amount + 1, 100) }); // +1 para compensar a mensagem do comando
    
    if (messages.size === 0) {
      return respond('❌ Não há mensagens para deletar!');
    }

    // Filtrar mensagens que podem ser deletadas (menos de 14 dias)
    const deletableMessages = messages.filter((msg: any) => {
      const messageAge = Date.now() - msg.createdTimestamp;
      return messageAge < 14 * 24 * 60 * 60 * 1000; // 14 dias em ms
    });

    if (deletableMessages.size === 0) {
      return respond('❌ Todas as mensagens são muito antigas para deletar! (máximo 14 dias)');
    }

    // Para comandos com prefixo, excluir a mensagem do comando
    const finalMessages = isPrefixCommand 
      ? deletableMessages.filter((msg: any) => msg.id !== (interaction as any).id)
      : deletableMessages;

    if (finalMessages.size === 0) {
      return respond('❌ Não há mensagens válidas para deletar!');
    }

    // Deletar mensagens
    await textChannel.bulkDelete(finalMessages);

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🗑️ Mensagens Deletadas')
      .setDescription(`**${finalMessages.size}** mensagens foram deletadas com sucesso!`)
      .addFields(
        { name: '👤 Executado por', value: interaction.user.tag, inline: true },
        { name: '📊 Quantidade', value: finalMessages.size.toString(), inline: true }
      )
      .setTimestamp();

    await respond({ embeds: [embed] });

  } catch (error) {
    console.error('Erro ao deletar mensagens:', error);
    return respond('❌ Erro ao deletar mensagens! Verifique se tenho permissão para deletar mensagens.');
  }
} 
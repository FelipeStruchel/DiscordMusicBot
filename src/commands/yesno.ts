import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('yesno')
  .setDescription('Responde sua pergunta com sim ou não')
  .addStringOption(option =>
    option.setName('pergunta')
      .setDescription('Sua pergunta (ex: Vou ganhar na loteria?)')
      .setRequired(true)
  );

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply();

  try {
    const question = (interaction as any).options.getString('pergunta')!;
    
    // Fazer requisição para a API yesno.wtf
    const response = await fetch('https://yesno.wtf/api');
    
    if (!response.ok) {
      return interaction.editReply('❌ Erro ao conectar com a API!');
    }

    const data = await response.json();
    
    // Determinar cor baseada na resposta
    let color: number;
    let emoji: string;
    
    switch (data.answer) {
      case 'yes':
        color = 0x00ff00;
        emoji = '✅';
        break;
      case 'no':
        color = 0xff0000;
        emoji = '❌';
        break;
      case 'maybe':
        color = 0xffff00;
        emoji = '🤔';
        break;
      default:
        color = 0x0099ff;
        emoji = '❓';
    }

    // Criar embed
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`${emoji} Resposta da Bola Mágica`)
      .setDescription(`**Pergunta:** ${question}`)
      .addFields(
        { name: '🎯 Resposta', value: data.answer.toUpperCase(), inline: true },
        { name: '🎲 Forçado', value: data.forced ? 'Sim' : 'Não', inline: true }
      )
      .setImage(data.image)
      .setTimestamp()
      .setFooter({ 
        text: `Perguntado por ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL()
      });

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Erro no comando yesno:', error);
    return interaction.editReply('❌ Erro ao processar sua pergunta!');
  }
} 
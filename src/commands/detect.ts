import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';
import { TranslationService } from '../services/TranslationService';

export const data = new SlashCommandBuilder()
  .setName('detect')
  .setDescription('Detecta o idioma de um texto')
  .addStringOption(option =>
    option.setName('texto')
      .setDescription('Texto para detectar o idioma')
      .setRequired(true)
  );

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply();

  try {
    const text = (interaction as any).options.getString('texto')!;

    // Validar texto
    if (text.length > 500) {
      return interaction.editReply('❌ Texto muito longo! Máximo 500 caracteres.');
    }

    // Instanciar serviço de tradução
    const translationService = new TranslationService();

    // Detectar idioma
    const result = await translationService.detectLanguage(text);

    if (result.success && result.sourceLanguage) {
      const languageName = translationService.getLanguageName(result.sourceLanguage);
      
      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('🔍 Detecção de Idioma')
        .setDescription(`**Texto:** ${text}`)
        .addFields(
          { 
            name: '🌍 Idioma detectado', 
            value: languageName, 
            inline: true 
          },
          { 
            name: '🔤 Código', 
            value: result.sourceLanguage.toUpperCase(), 
            inline: true 
          }
        )
        .setTimestamp()
        .setFooter({ 
          text: `Detectado por ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL()
        });

      return interaction.editReply({ embeds: [embed] });
    } else {
      return interaction.editReply(`❌ Erro na detecção: ${result.error}`);
    }
  } catch (error) {
    console.error('Erro no comando detect:', error);
    return interaction.editReply('❌ Erro ao detectar idioma!');
  }
} 
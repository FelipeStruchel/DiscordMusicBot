import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';
import { TranslationService } from '../services/TranslationService';

export const data = new SlashCommandBuilder()
  .setName('translate')
  .setDescription('Traduz texto entre idiomas')
  .addStringOption(option =>
    option.setName('texto')
      .setDescription('Texto para traduzir')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('para')
      .setDescription('Idioma de destino')
      .setRequired(true)
      .addChoices(
        { name: '🇺🇸 Inglês', value: 'en' },
        { name: '🇧🇷 Português', value: 'pt' },
        { name: '🇪🇸 Espanhol', value: 'es' },
        { name: '🇫🇷 Francês', value: 'fr' },
        { name: '🇩🇪 Alemão', value: 'de' },
        { name: '🇮🇹 Italiano', value: 'it' },
        { name: '🇷🇺 Russo', value: 'ru' },
        { name: '🇯🇵 Japonês', value: 'ja' },
        { name: '🇰🇷 Coreano', value: 'ko' },
        { name: '🇨🇳 Chinês', value: 'zh' },
        { name: '🇸🇦 Árabe', value: 'ar' },
        { name: '🇮🇳 Hindi', value: 'hi' }
      )
  )
  .addStringOption(option =>
    option.setName('de')
      .setDescription('Idioma de origem (deixe em branco para auto-detectar)')
      .setRequired(false)
      .addChoices(
        { name: '🔍 Auto-detectar', value: 'auto' },
        { name: '🇺🇸 Inglês', value: 'en' },
        { name: '🇧🇷 Português', value: 'pt' },
        { name: '🇪🇸 Espanhol', value: 'es' },
        { name: '🇫🇷 Francês', value: 'fr' },
        { name: '🇩🇪 Alemão', value: 'de' },
        { name: '🇮🇹 Italiano', value: 'it' },
        { name: '🇷🇺 Russo', value: 'ru' },
        { name: '🇯🇵 Japonês', value: 'ja' },
        { name: '🇰🇷 Coreano', value: 'ko' },
        { name: '🇨🇳 Chinês', value: 'zh' },
        { name: '🇸🇦 Árabe', value: 'ar' },
        { name: '🇮🇳 Hindi', value: 'hi' }
      )
  );

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply();

  try {
    const text = (interaction as any).options.getString('texto')!;
    const targetLang = (interaction as any).options.getString('para')!;
    const sourceLang = (interaction as any).options.getString('de') || 'auto';

    // Validar texto
    if (text.length > 500) {
      return interaction.editReply('❌ Texto muito longo! Máximo 500 caracteres.');
    }

    // Instanciar serviço de tradução
    const translationService = new TranslationService();

    // Traduzir
    const result = await translationService.translate(text, targetLang, sourceLang === 'auto' ? undefined : sourceLang);

    if (result.success && result.translatedText) {
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('🌐 Tradução')
        .setDescription(`**Texto original:** ${text}`)
        .addFields(
          { 
            name: '📝 Tradução', 
            value: result.translatedText, 
            inline: false 
          },
          { 
            name: '🔤 Idioma detectado', 
            value: translationService.getLanguageName(result.sourceLanguage || 'auto'), 
            inline: true 
          },
          { 
            name: '🎯 Idioma de destino', 
            value: translationService.getLanguageName(result.targetLanguage!), 
            inline: true 
          }
        )
        .setTimestamp()
        .setFooter({ 
          text: `Traduzido por ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL()
        });

      return interaction.editReply({ embeds: [embed] });
    } else {
      return interaction.editReply(`❌ Erro na tradução: ${result.error}`);
    }
  } catch (error) {
    console.error('Erro no comando translate:', error);
    return interaction.editReply('❌ Erro ao executar tradução!');
  }
} 
import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';
import { TranslationService } from '../services/TranslationService';

export const data = new SlashCommandBuilder()
  .setName('joke')
  .setDescription('Conta uma piada de pai e traduz automaticamente')
  .addStringOption(option =>
    option.setName('idioma')
      .setDescription('Idioma para traduzir a piada (padrão: português)')
      .setRequired(false)
      .addChoices(
        { name: '🇧🇷 Português', value: 'pt' },
        { name: '🇺🇸 Inglês (original)', value: 'en' },
        { name: '🇪🇸 Espanhol', value: 'es' },
        { name: '🇫🇷 Francês', value: 'fr' },
        { name: '🇩🇪 Alemão', value: 'de' },
        { name: '🇮🇹 Italiano', value: 'it' }
      )
  );

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply();

  try {
    const targetLang = (interaction as any).options.getString('idioma') || 'pt';
    const translationService = new TranslationService();

    // Buscar piada da API icanhazdadjoke
    const response = await fetch('https://icanhazdadjoke.com/', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TohsakaRin Bot (https://github.com/felipegrego23/tohsaka-rin-bot)'
      }
    });

    if (!response.ok) {
      return interaction.editReply('❌ Erro ao buscar piada!');
    }

    const data = await response.json();
    const originalJoke = data.joke;
    const jokeId = data.id;

    // Se o idioma for inglês, não traduzir
    if (targetLang === 'en') {
      const embed = new EmbedBuilder()
        .setColor(0xff6b6b)
        .setTitle('😄 Piada de Pai')
        .setDescription(`**${originalJoke}**`)
        .addFields(
          { name: '🌍 Idioma', value: '🇺🇸 Inglês (original)', inline: true },
          { name: '🆔 ID', value: jokeId, inline: true }
        )
        .setTimestamp()
        .setFooter({ 
          text: `Piada para ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL()
        });

      return interaction.editReply({ embeds: [embed] });
    }

    // Traduzir a piada
    console.log(`😄 Buscando piada: "${originalJoke}"`);
    const translationResult = await translationService.translate(originalJoke, targetLang, 'en');

    if (translationResult.success && translationResult.translatedText) {
      const embed = new EmbedBuilder()
        .setColor(0xff6b6b)
        .setTitle('😄 Piada de Pai')
        .setDescription(`**${translationResult.translatedText}**`)
        .addFields(
          { 
            name: '🌍 Traduzido para', 
            value: translationService.getLanguageName(targetLang), 
            inline: true 
          },
          { 
            name: '🆔 ID', 
            value: jokeId, 
            inline: true 
          },
          { 
            name: '🇺🇸 Original (Inglês)', 
            value: `\`\`\`${originalJoke}\`\`\``, 
            inline: false 
          }
        )
        .setTimestamp()
        .setFooter({ 
          text: `Piada traduzida para ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL()
        });

      return interaction.editReply({ embeds: [embed] });
    } else {
      // Se a tradução falhar, mostrar em inglês
      const embed = new EmbedBuilder()
        .setColor(0xff6b6b)
        .setTitle('😄 Piada de Pai')
        .setDescription(`**${originalJoke}**`)
        .addFields(
          { name: '🌍 Idioma', value: '🇺🇸 Inglês (tradução falhou)', inline: true },
          { name: '🆔 ID', value: jokeId, inline: true },
          { name: '⚠️ Aviso', value: 'Tradução não disponível', inline: false }
        )
        .setTimestamp()
        .setFooter({ 
          text: `Piada para ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL()
        });

      return interaction.editReply({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Erro no comando joke:', error);
    return interaction.editReply('❌ Erro ao buscar piada!');
  }
} 
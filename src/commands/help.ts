import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Mostra todos os comandos disponíveis');

export async function execute(interaction: CommandInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('🎵 Tohsaka Rin - Bot de Música')
    .setDescription('Lista de todos os comandos disponíveis:')
    .addFields(
      {
        name: '🎵 Comandos de Música',
        value: [
          '`/play <música/URL>` - Reproduz uma música',
          '`/pause` - Pausa a música atual',
          '`/resume` - Retoma a música pausada',
          '`/skip` - Pula para a próxima música',
          '`/stop` - Para a reprodução e limpa a fila',
          '`/queue` - Mostra a fila de músicas',
          '`/volume <0-100>` - Ajusta o volume'
        ].join('\n'),
        inline: false
      },
      {
        name: '🛠️ Comandos de Moderação',
        value: [
          '`/nuke` - Deleta e recria o canal (limpa mensagens)',
          '`/clear <quantidade>` - Deleta mensagens em lote'
        ].join('\n'),
        inline: false
      },
      {
        name: '🎲 Comandos de Dados',
        value: [
          '`/roll <dados>` - Rolagem personalizada (ex: 2d6+5)',
          '`/dice <tipo>` - Rolagem rápida de dados comuns',
          '`/yesno <pergunta>` - Responde sim/não com gif animado'
        ].join('\n'),
        inline: false
      },
      {
        name: '🌐 Comandos de Tradução',
        value: [
          '`/translate <texto> <para> [de]` - Traduz texto entre idiomas',
          '`/detect <texto>` - Detecta o idioma de um texto'
        ].join('\n'),
        inline: false
      },
      {
        name: '😄 Comandos de Entretenimento',
        value: [
          '`/joke [idioma]` - Conta uma piada de pai e traduz automaticamente'
        ].join('\n'),
        inline: false
      },
      {
        name: '🎂 Comandos de Aniversário',
        value: [
          '`/birthday add <dia> <mês> [ano]` - Adiciona seu aniversário',
          '`/birthday remove` - Remove seu aniversário',
          '`/birthday list` - Lista todos os aniversários',
          '`/birthday today` - Aniversários de hoje',
          '`/birthday upcoming [dias]` - Próximos aniversários'
        ].join('\n'),
        inline: false
      },
      {
        name: 'ℹ️ Comandos de Informação',
        value: [
          '`/serverinfo` - Informações do servidor',
          '`/userinfo [usuário]` - Informações do usuário',
          '`/ping` - Latência do bot',
          '`/help` - Mostra esta mensagem'
        ].join('\n'),
        inline: false
      }
    )
    .addFields({
      name: '💡 Dica',
      value: 'Você também pode usar comandos com prefixo `!` como `!play`, `!pause`, etc.',
      inline: false
    })
    .setFooter({ text: 'Desenvolvido com ❤️ por Felipe Struchel' })
    .setTimestamp();

  return interaction.reply({ embeds: [embed] });
} 
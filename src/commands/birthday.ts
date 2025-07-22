import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';
import { BirthdayService } from '../services/BirthdayService';

export const data = new SlashCommandBuilder()
  .setName('birthday')
  .setDescription('Gerencia aniversários')
  .addSubcommand(subcommand =>
    subcommand
      .setName('add')
      .setDescription('Adiciona ou atualiza seu aniversário')
      .addIntegerOption(option =>
        option.setName('dia')
          .setDescription('Dia do aniversário (1-31)')
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(31)
      )
      .addIntegerOption(option =>
        option.setName('mes')
          .setDescription('Mês do aniversário (1-12)')
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(12)
      )
      .addIntegerOption(option =>
        option.setName('ano')
          .setDescription('Ano de nascimento (opcional)')
          .setRequired(false)
          .setMinValue(1900)
          .setMaxValue(new Date().getFullYear())
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('remove')
      .setDescription('Remove seu aniversário')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('list')
      .setDescription('Lista todos os aniversários do servidor')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('today')
      .setDescription('Mostra aniversários de hoje')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('upcoming')
      .setDescription('Mostra próximos aniversários')
      .addIntegerOption(option =>
        option.setName('dias')
          .setDescription('Número de dias para verificar (1-90)')
          .setRequired(false)
          .setMinValue(1)
          .setMaxValue(90)
      )
  );

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply();

  const subcommand = (interaction as any).options.getSubcommand();
  const guildId = interaction.guildId!;
  const userId = interaction.user.id;
  const username = interaction.user.username;

  try {
    switch (subcommand) {
      case 'add': {
        const day = (interaction as any).options.getInteger('dia')!;
        const month = (interaction as any).options.getInteger('mes')!;
        const year = (interaction as any).options.getInteger('ano');

        const result = await BirthdayService.addBirthday(userId, guildId, username, day, month, year);
        
        if (result.success) {
          const formattedDate = BirthdayService.formatBirthday(day, month, year);
          const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🎂 Aniversário Registrado!')
            .setDescription(`**${username}** - ${formattedDate}`)
            .addFields(
              { name: '📅 Data', value: `${day}/${month}${year ? `/${year}` : ''}`, inline: true },
              { name: '👤 Usuário', value: username, inline: true }
            )
            .setTimestamp();

          return interaction.editReply({ embeds: [embed] });
        } else {
          return interaction.editReply('❌ Erro ao registrar aniversário!');
        }
      }

      case 'remove': {
        const result = await BirthdayService.removeBirthday(userId, guildId);
        
        if (result.success && result.deleted) {
          const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('🗑️ Aniversário Removido!')
            .setDescription(`Aniversário de **${username}** foi removido.`)
            .setTimestamp();

          return interaction.editReply({ embeds: [embed] });
        } else {
          return interaction.editReply('❌ Aniversário não encontrado ou erro ao remover!');
        }
      }

      case 'list': {
        const result = await BirthdayService.listBirthdays(guildId);
        
        if (result.success && result.birthdays) {
          if (result.birthdays.length === 0) {
            return interaction.editReply('📭 Não há aniversários registrados neste servidor!');
          }

          const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎂 Aniversários do Servidor')
            .setDescription('Lista de todos os aniversários registrados:')
            .setTimestamp();

          const birthdayList = result.birthdays.map((birthday: any) => {
            const formattedDate = BirthdayService.formatBirthday(birthday.day, birthday.month, birthday.year);
            return `**${birthday.username}** - ${formattedDate}`;
          }).join('\n');

          embed.addFields({
            name: '📋 Aniversários',
            value: birthdayList,
            inline: false
          });

          return interaction.editReply({ embeds: [embed] });
        } else {
          return interaction.editReply('❌ Erro ao listar aniversários!');
        }
      }

      case 'today': {
        const result = await BirthdayService.getTodayBirthdays(guildId);
        
        if (result.success && result.birthdays) {
          if (result.birthdays.length === 0) {
            return interaction.editReply('📭 Ninguém faz aniversário hoje!');
          }

          const embed = new EmbedBuilder()
            .setColor('#ffd93d')
            .setTitle('🎉 Aniversários de Hoje!')
            .setDescription('Parabéns para:')
            .setTimestamp();

          const birthdayList = result.birthdays.map((birthday: any) => {
            const formattedDate = BirthdayService.formatBirthday(birthday.day, birthday.month, birthday.year);
            return `🎂 **${birthday.username}** - ${formattedDate}`;
          }).join('\n');

          embed.addFields({
            name: '🎊 Parabéns!',
            value: birthdayList,
            inline: false
          });

          return interaction.editReply({ embeds: [embed] });
        } else {
          return interaction.editReply('❌ Erro ao buscar aniversários de hoje!');
        }
      }

      case 'upcoming': {
        const days = (interaction as any).options.getInteger('dias') || 30;
        const result = await BirthdayService.getUpcomingBirthdays(guildId, days);
        
        if (result.success && result.upcomingBirthdays) {
          if (result.upcomingBirthdays.length === 0) {
            return interaction.editReply(`📭 Nenhum aniversário nos próximos ${days} dias!`);
          }

          const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('📅 Próximos Aniversários')
            .setDescription(`Aniversários nos próximos ${days} dias:`)
            .setTimestamp();

          result.upcomingBirthdays.forEach((item: any) => {
            const birthdayList = item.birthdays.map((birthday: any) => {
              const formattedDate = BirthdayService.formatBirthday(birthday.day, birthday.month, birthday.year);
              return `🎂 **${birthday.username}** - ${formattedDate}`;
            }).join('\n');

            embed.addFields({
              name: `📅 ${item.date}`,
              value: birthdayList,
              inline: false
            });
          });

          return interaction.editReply({ embeds: [embed] });
        } else {
          return interaction.editReply('❌ Erro ao buscar próximos aniversários!');
        }
      }

      default:
        return interaction.editReply('❌ Subcomando inválido!');
    }
  } catch (error) {
    console.error('Erro no comando birthday:', error);
    return interaction.editReply('❌ Erro ao executar comando!');
  }
} 
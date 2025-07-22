import { Client, TextChannel, EmbedBuilder } from 'discord.js';
import { BirthdayService } from './BirthdayService';

export class BirthdayNotificationService {
  private client: Client;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(client: Client) {
    this.client = client;
  }

  // Iniciar serviço de notificação
  start() {
    console.log('🎂 Iniciando serviço de notificação de aniversários...');
    
    // Verificar aniversários a cada hora
    this.checkInterval = setInterval(() => {
      this.checkBirthdays();
    }, 60 * 60 * 1000); // 1 hora

    // Verificar imediatamente ao iniciar
    this.checkBirthdays();
  }

  // Parar serviço de notificação
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('🎂 Serviço de notificação de aniversários parado.');
    }
  }

  // Verificar aniversários de hoje
  private async checkBirthdays() {
    try {
      console.log('🎂 Verificando aniversários de hoje...');
      
      // Buscar todos os servidores onde o bot está presente
      const guilds = this.client.guilds.cache;
      
      for (const [guildId, guild] of guilds) {
        const result = await BirthdayService.getTodayBirthdays(guildId);
        
        if (result.success && result.birthdays && result.birthdays.length > 0) {
          await this.sendBirthdayNotifications(guildId, result.birthdays);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar aniversários:', error);
    }
  }

  // Enviar notificações de aniversário
  private async sendBirthdayNotifications(guildId: string, birthdays: any[]) {
    try {
      const guild = this.client.guilds.cache.get(guildId);
      if (!guild) return;

      // Buscar canal de anúncios ou primeiro canal de texto
      let channel = guild.channels.cache.find(
        ch => ch.type === 0 && ch.name.toLowerCase().includes('anúncio')
      ) as TextChannel;

      if (!channel) {
        channel = guild.channels.cache.find(
          ch => ch.type === 0
        ) as TextChannel;
      }

      if (!channel) {
        console.log(`❌ Nenhum canal de texto encontrado no servidor ${guild.name}`);
        return;
      }

      // Criar embed de aniversário
      const embed = new EmbedBuilder()
        .setColor('#ffd93d')
        .setTitle('🎉 Aniversários de Hoje!')
        .setDescription('Parabéns para:')
        .setTimestamp();

      const birthdayList = birthdays.map((birthday: any) => {
        const formattedDate = BirthdayService.formatBirthday(birthday.day, birthday.month, birthday.year);
        return `🎂 **${birthday.username}** - ${formattedDate}`;
      }).join('\n');

      embed.addFields({
        name: '🎊 Parabéns!',
        value: birthdayList,
        inline: false
      });

      // Adicionar gif de aniversário
      embed.setImage('https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif');

      // Enviar mensagem
      await channel.send({ embeds: [embed] });
      
      console.log(`✅ Notificação de aniversário enviada no servidor ${guild.name}`);
    } catch (error) {
      console.error('❌ Erro ao enviar notificação de aniversário:', error);
    }
  }

  // Verificar aniversários de um servidor específico (para testes)
  async checkGuildBirthdays(guildId: string) {
    try {
      const result = await BirthdayService.getTodayBirthdays(guildId);
      
      if (result.success && result.birthdays && result.birthdays.length > 0) {
        await this.sendBirthdayNotifications(guildId, result.birthdays);
        return { success: true, count: result.birthdays.length };
      } else {
        return { success: true, count: 0 };
      }
    } catch (error) {
      console.error('❌ Erro ao verificar aniversários do servidor:', error);
      return { success: false, error };
    }
  }
} 
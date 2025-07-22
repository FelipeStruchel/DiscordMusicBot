import { Birthday } from '../models/Birthday';
import { Op } from 'sequelize';

export class BirthdayService {
  // Adicionar aniversário
  static async addBirthday(userId: string, guildId: string, username: string, day: number, month: number, year?: number) {
    try {
      const [birthday, created] = await Birthday.findOrCreate({
        where: { userId, guildId },
        defaults: {
          userId,
          guildId,
          username,
          day,
          month,
          year,
          time_exec: new Date(),
          time_import: new Date(),
        },
      });

      if (!created) {
        // Atualizar aniversário existente
        await birthday.update({
          username,
          day,
          month,
          year,
          time_exec: new Date(),
        });
      }

      return { success: true, created, birthday };
    } catch (error) {
      console.error('Erro ao adicionar aniversário:', error);
      return { success: false, error };
    }
  }

  // Remover aniversário
  static async removeBirthday(userId: string, guildId: string) {
    try {
      const deleted = await Birthday.destroy({
        where: { userId, guildId },
      });

      return { success: true, deleted: deleted > 0 };
    } catch (error) {
      console.error('Erro ao remover aniversário:', error);
      return { success: false, error };
    }
  }

  // Listar aniversários de um servidor
  static async listBirthdays(guildId: string) {
    try {
      const birthdays = await Birthday.findAll({
        where: { guildId },
        order: [['month', 'ASC'], ['day', 'ASC']],
      });

      return { success: true, birthdays };
    } catch (error) {
      console.error('Erro ao listar aniversários:', error);
      return { success: false, error };
    }
  }

  // Buscar aniversário específico
  static async getBirthday(userId: string, guildId: string) {
    try {
      const birthday = await Birthday.findOne({
        where: { userId, guildId },
      });

      return { success: true, birthday };
    } catch (error) {
      console.error('Erro ao buscar aniversário:', error);
      return { success: false, error };
    }
  }

  // Buscar aniversários de hoje
  static async getTodayBirthdays(guildId: string) {
    try {
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1; // getMonth() retorna 0-11

      const birthdays = await Birthday.findAll({
        where: {
          guildId,
          day,
          month,
        },
      });

      return { success: true, birthdays };
    } catch (error) {
      console.error('Erro ao buscar aniversários de hoje:', error);
      return { success: false, error };
    }
  }

  // Buscar próximos aniversários (próximos 30 dias)
  static async getUpcomingBirthdays(guildId: string, days: number = 30) {
    try {
      const today = new Date();
      const upcomingBirthdays = [];

      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const day = date.getDate();
        const month = date.getMonth() + 1;

        const birthdays = await Birthday.findAll({
          where: {
            guildId,
            day,
            month,
          },
        });

        if (birthdays.length > 0) {
          upcomingBirthdays.push({
            date: date.toISOString().split('T')[0],
            day,
            month,
            birthdays,
          });
        }
      }

      return { success: true, upcomingBirthdays };
    } catch (error) {
      console.error('Erro ao buscar próximos aniversários:', error);
      return { success: false, error };
    }
  }

  // Calcular idade
  static calculateAge(birthYear: number): number {
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  }

  // Formatar data de aniversário
  static formatBirthday(day: number, month: number, year?: number): string {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const formattedDate = `${day} de ${monthNames[month - 1]}`;
    
    if (year) {
      const age = this.calculateAge(year);
      return `${formattedDate} (${age} anos)`;
    }

    return formattedDate;
  }
} 
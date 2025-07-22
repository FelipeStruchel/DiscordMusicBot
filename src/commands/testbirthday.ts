import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { BirthdayNotificationService } from '../services/BirthdayNotificationService';

export const data = new SlashCommandBuilder()
  .setName('testbirthday')
  .setDescription('Testa o sistema de notificação de aniversários (apenas para administradores)');

export async function execute(interaction: CommandInteraction) {
  // Verificar se o usuário é administrador
  if (!interaction.memberPermissions?.has('Administrator')) {
    return interaction.reply({
      content: '❌ Apenas administradores podem usar este comando!',
      ephemeral: true
    });
  }

  await interaction.deferReply();

  try {
    const guildId = interaction.guildId!;
    
    // Buscar o serviço de notificação do cliente
    const client = interaction.client as any;
    const birthdayNotificationService = client.birthdayNotificationService;

    if (!birthdayNotificationService) {
      return interaction.editReply('❌ Serviço de notificação não encontrado!');
    }

    // Testar notificação
    const result = await birthdayNotificationService.checkGuildBirthdays(guildId);
    
    if (result.success) {
      if (result.count > 0) {
        return interaction.editReply(`✅ Teste realizado! ${result.count} aniversário(s) encontrado(s) e notificação enviada.`);
      } else {
        return interaction.editReply('✅ Teste realizado! Nenhum aniversário encontrado para hoje.');
      }
    } else {
      return interaction.editReply('❌ Erro ao testar notificação de aniversário!');
    }
  } catch (error) {
    console.error('Erro no comando testbirthday:', error);
    return interaction.editReply('❌ Erro ao executar teste!');
  }
} 
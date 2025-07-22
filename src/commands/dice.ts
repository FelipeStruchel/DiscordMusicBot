import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('dice')
  .setDescription('Rola dados comuns rapidamente')
  .addStringOption(option =>
    option.setName('tipo')
      .setDescription('Tipo de dado')
      .setRequired(true)
      .addChoices(
        { name: 'd4', value: 'd4' },
        { name: 'd6', value: 'd6' },
        { name: 'd8', value: 'd8' },
        { name: 'd10', value: 'd10' },
        { name: 'd12', value: 'd12' },
        { name: 'd20', value: 'd20' },
        { name: 'd100', value: 'd100' }
      )
  )
  .addIntegerOption(option =>
    option.setName('quantidade')
      .setDescription('Quantidade de dados (1-10)')
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(10)
  );

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply();

  const diceType = (interaction as any).options.getString('tipo')!;
  const quantity = (interaction as any).options.getInteger('quantidade') || 1;

  const diceSize = parseInt(diceType.substring(1));
  const rolls: number[] = [];
  let total = 0;

  // Rolar os dados
  for (let i = 0; i < quantity; i++) {
    const roll = Math.floor(Math.random() * diceSize) + 1;
    rolls.push(roll);
    total += roll;
  }

  // Verificar críticos
  const isCritical = (diceSize === 20 && rolls.some(r => r === 20)) || 
                    (quantity > 1 && rolls.every(r => r === diceSize));
  const isFumble = (diceSize === 20 && rolls.some(r => r === 1)) || 
                   (quantity > 1 && rolls.every(r => r === 1));

  const embed = new EmbedBuilder()
    .setColor('#ff6b6b')
    .setTitle('🎲 Rolagem Rápida')
    .addFields(
      { name: '📝 Dados', value: `${quantity}${diceType}`, inline: true },
      { name: '🎯 Total', value: `**${total}**`, inline: true },
      { name: '📊 Resultados', value: `[${rolls.join(', ')}]`, inline: false }
    )
    .setTimestamp();

  if (isCritical) {
    embed.setColor('#ffd93d');
    embed.addFields({ name: '🔥 Crítico!', value: 'Rolagem especial!', inline: true });
  }

  if (isFumble) {
    embed.setColor('#ff4757');
    embed.addFields({ name: '💥 Falha Crítica!', value: 'Que azar!', inline: true });
  }

  return interaction.editReply({ embeds: [embed] });
} 
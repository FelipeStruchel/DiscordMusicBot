import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('roll')
  .setDescription('Rola dados para RPG ou jogos')
  .addStringOption(option =>
    option.setName('dados')
      .setDescription('Formato dos dados (ex: 1d20, 2d6, 3d10+5)')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('descricao')
      .setDescription('Descrição da rolagem (opcional)')
      .setRequired(false)
  );

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply();

  const diceString = (interaction as any).options.getString('dados')!;
  const description = (interaction as any).options.getString('descricao') || '';

  try {
    const result = parseAndRollDice(diceString);
    
    const embed = new EmbedBuilder()
      .setColor('#ff6b6b')
      .setTitle('🎲 Rolagem de Dados')
      .addFields(
        { name: '📝 Comando', value: `\`${diceString}\``, inline: true },
        { name: '🎯 Resultado', value: `**${result.total}**`, inline: true },
        { name: '📊 Detalhes', value: result.details, inline: false }
      )
      .setTimestamp();

    if (description) {
      embed.addFields({ name: '📖 Descrição', value: description, inline: false });
    }

    // Adicionar emoji especial para críticos
    if (result.isCritical) {
      embed.setColor('#ffd93d');
      embed.addFields({ name: '🔥 Crítico!', value: 'Rolagem especial!', inline: true });
    }

    if (result.isFumble) {
      embed.setColor('#ff4757');
      embed.addFields({ name: '💥 Falha Crítica!', value: 'Que azar!', inline: true });
    }

    return interaction.editReply({ embeds: [embed] });

  } catch (error) {
    return interaction.editReply('❌ Formato inválido! Use: `1d20`, `2d6+5`, `3d10-2`');
  }
}

interface DiceResult {
  total: number;
  details: string;
  isCritical: boolean;
  isFumble: boolean;
}

function parseAndRollDice(diceString: string): DiceResult {
  // Padrão: XdY+Z ou XdY-Z
  const regex = /^(\d+)d(\d+)([+-]\d+)?$/;
  const match = diceString.toLowerCase().match(regex);
  
  if (!match) {
    throw new Error('Formato inválido');
  }

  const numDice = parseInt(match[1]);
  const diceSize = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3]) : 0;

  if (numDice > 100) {
    throw new Error('Máximo 100 dados por vez');
  }

  if (diceSize > 1000) {
    throw new Error('Dados muito grandes');
  }

  const rolls: number[] = [];
  let total = 0;

  // Rolar os dados
  for (let i = 0; i < numDice; i++) {
    const roll = Math.floor(Math.random() * diceSize) + 1;
    rolls.push(roll);
    total += roll;
  }

  // Aplicar modificador
  total += modifier;

  // Criar detalhes
  let details = `Rolou ${numDice}d${diceSize}`;
  if (modifier !== 0) {
    details += `${modifier >= 0 ? '+' : ''}${modifier}`;
  }
  details += `\n**Resultados:** [${rolls.join(', ')}]`;
  
  if (modifier !== 0) {
    details += `\n**Total:** ${total - modifier} ${modifier >= 0 ? '+' : ''}${modifier} = **${total}**`;
  }

  // Verificar críticos (20 em d20, ou todos máximos)
  const isCritical = (diceSize === 20 && rolls.some(r => r === 20)) || 
                    (rolls.length > 0 && rolls.every(r => r === diceSize));

  // Verificar falhas críticas (1 em d20, ou todos mínimos)
  const isFumble = (diceSize === 20 && rolls.some(r => r === 1)) || 
                   (rolls.length > 0 && rolls.every(r => r === 1));

  return {
    total,
    details,
    isCritical,
    isFumble
  };
} 
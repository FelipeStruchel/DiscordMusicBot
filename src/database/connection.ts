import { Sequelize } from 'sequelize';
import path from 'path';

// Criar conexão com SQLite
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false, // Desabilitar logs SQL
});

// Função para inicializar o banco de dados
export async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida com sucesso!');
    
    // Sincronizar modelos com o banco
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados com o banco de dados!');
  } catch (error) {
    console.error('❌ Erro ao conectar com banco de dados:', error);
  }
} 
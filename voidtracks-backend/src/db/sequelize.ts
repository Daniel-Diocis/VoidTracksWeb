import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // così carica le variabili .env

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  logging: false,
});

export default sequelize;
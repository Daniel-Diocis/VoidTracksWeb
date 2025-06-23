import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Caricamento delle variabili d'ambiente dal file .env
dotenv.config();

/**
 * Stringa di connessione al database PostgreSQL.
 * Deve essere definita nella variabile d'ambiente `DATABASE_URL`.
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

/**
 * Istanza di Sequelize configurata per connettersi a un database PostgreSQL.
 * - Disabilita i log SQL (logging: false)
 * - Utilizza la stringa di connessione fornita dalle variabili d'ambiente
 */
const sequelize = new Sequelize(connectionString, {
  dialect: "postgres",
  logging: false,
});

export default sequelize;
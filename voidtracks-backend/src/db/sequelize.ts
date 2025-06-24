import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

let sequelizeInstance: Sequelize | null = null;

/**
 * Restituisce l'istanza condivisa di Sequelize configurata per PostgreSQL.
 *
 * - Utilizza la stringa di connessione `DATABASE_URL` dal file `.env`.
 * - Disabilita i log SQL per mantenere l’output della console pulito (`logging: false`).
 * - Implementa il pattern Singleton per garantire un'unica istanza in tutta l’applicazione.
 *
 * @returns Istanza condivisa di Sequelize.
 * @throws Errore se la variabile `DATABASE_URL` non è definita.
 */
export function getSequelizeInstance(): Sequelize {
  if (!sequelizeInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not defined in environment variables");
    }

    sequelizeInstance = new Sequelize(connectionString, {
      dialect: "postgres",
      logging: false,
    });
  }

  return sequelizeInstance;
}
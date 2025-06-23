import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

let sequelizeInstance: Sequelize | null = null;

/**
 * Restituisce un'istanza singleton di Sequelize configurata per PostgreSQL.
 *
 * - Utilizza la stringa di connessione `DATABASE_URL` definita nel file `.env`.
 * - Disabilita i log SQL per mantenere l'output pulito (`logging: false`).
 * - Garantisce che venga creata una sola istanza condivisa in tutta l'applicazione.
 *
 * @returns {Sequelize} Istanza condivisa di Sequelize.
 *
 * @throws {Error} Se la variabile `DATABASE_URL` non è definita.
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
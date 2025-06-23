"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSequelizeInstance = getSequelizeInstance;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let sequelizeInstance = null;
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
function getSequelizeInstance() {
    if (!sequelizeInstance) {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error("DATABASE_URL is not defined in environment variables");
        }
        sequelizeInstance = new sequelize_1.Sequelize(connectionString, {
            dialect: "postgres",
            logging: false,
        });
    }
    return sequelizeInstance;
}

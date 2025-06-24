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
 * Restituisce l'istanza condivisa di Sequelize configurata per PostgreSQL.
 *
 * - Utilizza la stringa di connessione `DATABASE_URL` dal file `.env`.
 * - Disabilita i log SQL per mantenere l’output della console pulito (`logging: false`).
 * - Implementa il pattern Singleton per garantire un'unica istanza in tutta l’applicazione.
 *
 * @returns Istanza condivisa di Sequelize.
 * @throws Errore se la variabile `DATABASE_URL` non è definita.
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

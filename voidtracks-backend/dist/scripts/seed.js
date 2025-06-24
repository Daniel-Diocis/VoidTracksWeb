"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const sequelize_1 = require("../db/sequelize");
const User_1 = __importDefault(require("../models/User"));
const sequelize = (0, sequelize_1.getSequelizeInstance)();
/**
 * Attende che il database sia disponibile prima di procedere.
 *
 * - Tenta di autenticarsi più volte con un intervallo tra i tentativi.
 * - Utile nei contesti Docker o in ambienti distribuiti dove il DB può impiegare
 *   qualche secondo ad avviarsi.
 *
 * @param retries Numero massimo di tentativi (default: 10)
 * @param delayMs Tempo di attesa in millisecondi tra i tentativi (default: 2000)
 * @throws Errore se la connessione fallisce dopo tutti i tentativi
 */
async function waitForDatabase(retries = 10, delayMs = 2000) {
    while (retries > 0) {
        try {
            await sequelize.authenticate();
            console.log("Connessione al DB riuscita");
            return;
        }
        catch (err) {
            console.log(`Tentativo fallito. Riprovo tra ${delayMs / 1000} secondi...`);
            retries--;
            await new Promise((res) => setTimeout(res, delayMs));
        }
    }
    throw new Error("Impossibile connettersi al database dopo diversi tentativi.");
}
/**
 * Inserisce utenti predefiniti nel database.
 *
 * - Crea un amministratore e due utenti normali.
 * - Le password sono salvate in forma hashata.
 * - Se l'utente esiste già (per `username`), non viene duplicato.
 */
async function seed() {
    try {
        await waitForDatabase(); // Verifica che il DB sia pronto
        await sequelize.sync(); // Sincronizza i modelli con il DB
        const users = [
            {
                username: "admin",
                password: "password0",
                tokens: 100,
                role: "admin",
            },
            {
                username: "utenteUno",
                password: "passwordUno",
                tokens: 10,
                role: "user",
            },
            {
                username: "utenteDue",
                password: "passwordDue",
                tokens: 10,
                role: "user",
            },
        ];
        for (const u of users) {
            const hashedPassword = await bcryptjs_1.default.hash(u.password, 10);
            const [user, created] = await User_1.default.findOrCreate({
                where: { username: u.username },
                defaults: {
                    username: u.username,
                    password_hash: hashedPassword,
                    tokens: u.tokens,
                    role: u.role,
                },
            });
            console.log(created ? `Creato: ${u.username}` : `Esiste già: ${u.username}`);
        }
    }
    catch (err) {
        console.error("Errore nel seed:", err);
    }
    finally {
        await sequelize.close();
    }
}
// Avvia il seeding
seed();

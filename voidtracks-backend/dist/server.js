"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const sequelize_1 = require("./db/sequelize");
require("./db"); // Importa index.ts per eseguire setup dei modelli + associazioni
const app_1 = __importDefault(require("./app")); // Prende l'app Express con tutte le rotte collegate
const syncSupabaseToLocal_1 = require("./utils/syncSupabaseToLocal");
// Carica le variabili d'ambiente da .env in modo che siano disponibili in process.env
dotenv_1.default.config();
// Imposta la porta del server e l'istanza Sequelize
const PORT = process.env.PORT || 3000;
const sequelize = (0, sequelize_1.getSequelizeInstance)();
/**
 * Avvia il server Express e sincronizza il database.
 *
 * - Autentica la connessione al database.
 * - Sincronizza i modelli Sequelize.
 * - Avvia il server HTTP sulla porta specificata.
 * - Avvia in background la sincronizzazione dati da Supabase.
 */
const startServer = async () => {
    try {
        // Autenticazione al database
        await sequelize.authenticate(); // Prova a connettersi al database con le credenziali fornite
        console.log("Connessione al database stabilita con successo.");
        // Sincronizza i modelli con il database (alter modifica le tabelle se necessario)
        await sequelize.sync({ alter: true });
        // Avvia il server Express (app sta per Express())
        app_1.default.listen(PORT, () => {
            console.log(`Server avviato su http://localhost:${PORT}`);
        });
        // Esegue la sincronizzazione da Supabase in background
        const supaTracks = await (0, syncSupabaseToLocal_1.syncTracksFromSupabase)(); // Restituisce i brani nuovi o aggiornati
        await (0, syncSupabaseToLocal_1.syncArtistsFromSupabase)(); // Sincronizza gli artisti
        await (0, syncSupabaseToLocal_1.syncTrackArtistsFromSupabase)(supaTracks); // Collega gli artisti ai brani
    }
    catch (error) {
        console.error("Impossibile connettersi al database:", error);
    }
};
startServer();

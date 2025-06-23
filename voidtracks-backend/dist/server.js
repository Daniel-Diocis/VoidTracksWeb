"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const sequelize_1 = require("./db/sequelize");
require("./db"); // importa index.ts per eseguire le associazioni
const app_1 = __importDefault(require("./app"));
const syncSupabaseToLocal_1 = require("./utils/syncSupabaseToLocal");
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
const sequelize = (0, sequelize_1.getSequelizeInstance)();
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connessione al database stabilita con successo.");
        await sequelize.sync({ alter: true });
        app_1.default.listen(PORT, () => {
            console.log(`Server avviato su http://localhost:${PORT}`);
        });
        // Sincronizza in background
        const supaTracks = await (0, syncSupabaseToLocal_1.syncTracksFromSupabase)(); // Modifica questa funzione per farla ritornare i dati sincronizzati
        await (0, syncSupabaseToLocal_1.syncArtistsFromSupabase)(); // Se vuoi puoi farla tornare i dati degli artisti se ti serve
        await (0, syncSupabaseToLocal_1.syncTrackArtistsFromSupabase)(supaTracks); // Passo i dati brani qui
    }
    catch (error) {
        console.error("Impossibile connettersi al database:", error);
    }
};
startServer();

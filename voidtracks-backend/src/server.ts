import dotenv from "dotenv";
import { getSequelizeInstance } from "./db/sequelize";
import "./db"; // Importa index.ts per eseguire le associazioni tra i modelli
import app from "./app";
import { 
  syncTracksFromSupabase, 
  syncArtistsFromSupabase, 
  syncTrackArtistsFromSupabase 
} from "./utils/syncSupabaseToLocal";

// Carica le variabili d'ambiente da .env
dotenv.config();

const PORT = process.env.PORT || 3000;
const sequelize = getSequelizeInstance();

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
    await sequelize.authenticate();
    console.log("Connessione al database stabilita con successo.");

    // Sincronizza i modelli con il database (alter modifica le tabelle se necessario)
    await sequelize.sync({ alter: true });

    // Avvia il server
    app.listen(PORT, () => {
      console.log(`Server avviato su http://localhost:${PORT}`);
    });

    // Esegue la sincronizzazione da Supabase in background
    const supaTracks = await syncTracksFromSupabase();     // Restituisce i brani nuovi o aggiornati
    await syncArtistsFromSupabase();                        // Sincronizza gli artisti
    await syncTrackArtistsFromSupabase(supaTracks);         // Collega gli artisti ai brani
  } catch (error) {
    console.error("Impossibile connettersi al database:", error);
  }
};

startServer();
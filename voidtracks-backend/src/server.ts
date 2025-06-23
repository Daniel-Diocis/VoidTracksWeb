import dotenv from "dotenv";
import { getSequelizeInstance } from "./db/sequelize";
import "./db"; // importa index.ts per eseguire le associazioni
import app from "./app";
import { syncTracksFromSupabase, syncArtistsFromSupabase, syncTrackArtistsFromSupabase } from "./utils/syncSupabaseToLocal";

dotenv.config();

const PORT = process.env.PORT || 3000;
const sequelize = getSequelizeInstance();

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connessione al database stabilita con successo.");

    await sequelize.sync({ alter: true });

    app.listen(PORT, () => {
      console.log(`Server avviato su http://localhost:${PORT}`);
    });

    // Sincronizza in background
    const supaTracks = await syncTracksFromSupabase(); // Modifica questa funzione per farla ritornare i dati sincronizzati
    await syncArtistsFromSupabase(); // Se vuoi puoi farla tornare i dati degli artisti se ti serve
    await syncTrackArtistsFromSupabase(supaTracks); // Passo i dati brani qui
  } catch (error) {
    console.error("Impossibile connettersi al database:", error);
  }
};

startServer();

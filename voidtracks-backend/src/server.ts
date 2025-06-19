import dotenv from "dotenv";
import sequelize from "./db/sequelize";
import "./db"; // importa index.ts per eseguire le associazioni
import app from "./app";
import { syncTracksFromSupabase } from "./utils/syncSupabaseToLocal";

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connessione al database stabilita con successo.");

    await sequelize.sync({ alter: true });

    app.listen(PORT, () => {
      console.log(`Server avviato su http://localhost:${PORT}`);
    });

    // Sincronizza in background
    syncTracksFromSupabase().catch(console.error);
  } catch (error) {
    console.error("Impossibile connettersi al database:", error);
  }
};

startServer();

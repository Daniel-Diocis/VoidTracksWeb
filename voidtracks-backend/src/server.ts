import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './db/sequelize';
import tracksRouter from './routes/Tracks';
import { syncTracksFromSupabase } from './utils/syncSupabaseToLocal';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.json({ message: 'Backend VoidTracks attivo!' });
});

app.use('/tracks', tracksRouter);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connessione al database stabilita con successo.');

    // Sincronizza i modelli creando le tabelle se non esistono
    await sequelize.sync({ alter: true }); // o { force: true } se vuoi cancellare e ricreare le tabelle

    // Dopo la sincronizzazione puoi fare il sync da Supabase
    await syncTracksFromSupabase();

    app.listen(PORT, () => {
      console.log(`Server avviato su http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Impossibile connettersi al database:', error);
  }
};

startServer();
import { Router, Request, Response } from 'express';
import Track from '../models/Track';

const router = Router();

router.get('/tracks', async (req: Request, res: Response) => {
  try {
    const tracks = await Track.findAll();

    // Ordina secondo la tua logica
    const ordinati = tracks.sort((a, b) => {
      const artistaA = a.artista.split(',')[0].trim().toLowerCase();
      const artistaB = b.artista.split(',')[0].trim().toLowerCase();
      const confrontoArtista = artistaA.localeCompare(artistaB);
      if (confrontoArtista !== 0) return confrontoArtista;
      return a.titolo.toLowerCase().localeCompare(b.titolo.toLowerCase());
    });

    res.json(ordinati); // restituisci array di brani ordinati
  } catch (error) {
    console.error('Errore caricamento brani:', error);
    res.status(500).json({ error: 'Errore nel recupero dei brani' });
  }
});

export default router;
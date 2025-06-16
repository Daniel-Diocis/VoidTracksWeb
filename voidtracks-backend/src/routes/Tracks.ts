import { Router, Request, Response } from 'express';
import Track from '../models/Track'; // Assicurati che il percorso sia corretto

const router = Router();

// GET /tracks - ritorna tutti i brani
router.get('/', async (_req: Request, res: Response) => {
  try {
    const tracks = await Track.findAll();
    res.json(tracks);
  } catch (error) {
    console.error('Errore recupero brani:', error);
    res.status(500).json({ error: 'Errore server' });
  }
});

export default router;
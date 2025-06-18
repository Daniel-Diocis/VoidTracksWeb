import { Request, Response } from 'express';
import { fn, col } from 'sequelize';
import Track from '../models/Track';
import Purchase from '../models/Purchase';

export async function getAllTracks(req: Request, res: Response) {
  try {
    const tracks = await Track.findAll();
    res.json(tracks);
  } catch (error) {
    console.error('Errore recupero brani:', error);
    res.status(500).json({ error: 'Errore server' });
  }
}

export async function getPopularTracks(req: Request, res: Response) {
  try {
    const topTracks = await Purchase.findAll({
      attributes: [
        'track_id',
        [fn('COUNT', col('track_id')), 'num_acquisti'],
      ],
      group: ['track_id', 'Track.id'],
      include: [{
        model: Track,
        attributes: ['id', 'titolo', 'artista', 'album', 'cover_path'],
      }],
      order: [[fn('COUNT', col('track_id')), 'DESC']],
      limit: 10,
    });

    res.json(topTracks);
  } catch (error) {
    console.error('Errore nel recupero dei brani popolari:', error);
    res.status(500).json({ error: 'Errore del server' });
  }
}
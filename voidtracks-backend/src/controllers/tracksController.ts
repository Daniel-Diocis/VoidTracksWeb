import { Request, Response } from 'express';
import { fn, col, Op } from 'sequelize';
import Track from '../models/Track';
import Purchase from '../models/Purchase';

export async function getAllTracks(req: Request, res: Response) {
  try {
    const query = req.query.q as string | undefined;

    let whereClause = {};
    if (query) {
      whereClause = {
        [Op.or]: [
          { titolo: { [Op.iLike]: `%${query}%` } },
          { artista: { [Op.iLike]: `%${query}%` } },
          { album: { [Op.iLike]: `%${query}%` } },
        ],
      };
    }

    const tracks = await Track.findAll({ where: whereClause });
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
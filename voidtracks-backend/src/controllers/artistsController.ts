import { Request, Response } from "express";
import Artist from "../models/Artist";
import Track from '../models/Track';
import { Op } from "sequelize";

export async function getAllArtists(req: Request, res: Response) {
  try {
    const artists = await Artist.findAll();
    res.json(artists);
  } catch (error) {
    console.error("Errore recupero artisti:", error);
    res.status(500).json({ error: "Errore server" });
  }
}

export async function getArtistByName(req: Request, res: Response) {
  const { nome } = req.params;
  try {
    const artist = await Artist.findOne({
    where: {
        nome: {
        [Op.iLike]: nome,
        },
    },
    include: [{
        model: Track,
        attributes: ['id', 'titolo', 'album', 'music_path', 'cover_path'],
        through: { attributes: [] } // esclude dati della tabella di join
    }]
    });
    if (!artist) return res.status(404).json({ error: "Artista non trovato" });
    res.json(artist);
  } catch (error) {
    console.error("Errore recupero artista per nome:", error);
    res.status(500).json({ error: "Errore server" });
  }
}
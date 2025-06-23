import { Request, Response } from "express";
import { Op } from "sequelize";
import { StatusCodes } from "http-status-codes";
import { MessageFactory } from "../utils/messageFactory";
import Artist from "../models/Artist";
import Track from '../models/Track';

const factory = new MessageFactory();

export async function getAllArtists(req: Request, res: Response) {
  try {
    const artists = await Artist.findAll();
    res.json(artists);
  } catch (error) {
    console.error("Errore recupero artisti:", error);
    return factory.getStatusMessage(res, StatusCodes.INTERNAL_SERVER_ERROR, "Errore durante il recupero degli artisti");
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

    if (!artist) {
      return factory.getStatusMessage(res, StatusCodes.NOT_FOUND, "Artista non trovato");
    }

    res.json(artist);
  } catch (error) {
    console.error("Errore recupero artista per nome:", error);
    return factory.getStatusMessage(res, StatusCodes.INTERNAL_SERVER_ERROR, "Errore durante il recupero dell'artista");
  }
}
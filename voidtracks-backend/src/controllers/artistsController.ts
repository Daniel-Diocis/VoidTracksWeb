import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { ErrorMessages } from "../utils/errorMessages";
import { MessageFactory } from "../utils/messageFactory";
import Artist from "../models/Artist";
import Track from "../models/Track";

const factory = new MessageFactory();

/**
 * Restituisce tutti gli artisti presenti nel database.
 *
 * - Esegue una query su tutti i record della tabella `Artist`.
 * - In caso di successo, restituisce un array di artisti in formato JSON.
 *
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @returns Risposta JSON contenente la lista di tutti gli artisti oppure errore.
 */
export async function getAllArtists(req: Request, res: Response, next: NextFunction) {
  try {
    const artists = await Artist.findAll();
    res.json(artists);
  } catch (error) {
    console.error("Errore recupero artisti:", error);
    return factory.getStatusMessage(res, ErrorMessages.INTERNAL_ERROR.status, ErrorMessages.INTERNAL_ERROR.message);
  }
}

/**
 * Restituisce un artista in base al nome (case-insensitive), includendo i brani associati.
 *
 * - Esegue una ricerca `iLike` sul nome artista per ignorare maiuscole/minuscole.
 * - Include nella risposta l'elenco dei brani collegati (senza attributi della tabella pivot).
 *
 * @param req - Oggetto della richiesta HTTP con parametro `nome`.
 * @param res - Oggetto della risposta HTTP.
 * @returns Risposta JSON con i dati dell’artista e dei suoi brani, oppure errore.
 */
export async function getArtistByName(req: Request, res: Response, next: NextFunction) {
  const { nome } = req.params;

  try {
    const artist = await Artist.findOne({
      where: {
        nome: {
          [Op.iLike]: nome,
        },
      },
      include: [
        {
          model: Track,
          attributes: ["id", "titolo", "album", "music_path", "cover_path"],
          through: { attributes: [] },
        },
      ],
    });

    if (!artist) {
      return factory.getStatusMessage(res, ErrorMessages.ARTIST_NOT_FOUND.status, ErrorMessages.ARTIST_NOT_FOUND.message);
    }

    res.json(artist);
  } catch (error) {
    console.error("Errore recupero artista per nome:", error);
    return factory.getStatusMessage(res, ErrorMessages.INTERNAL_ERROR.status, ErrorMessages.INTERNAL_ERROR.message);
  }
}
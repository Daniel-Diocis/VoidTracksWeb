import { Request, Response } from "express";
import { fn, col, Op } from "sequelize";
import { ErrorMessages } from "../utils/errorMessages";
import { MessageFactory } from "../utils/messageFactory";
import Track from "../models/Track";
import Purchase from "../models/Purchase";

const factory = new MessageFactory();

/**
 * Restituisce l’elenco completo dei brani presenti nel sistema.
 *
 * - Se presente una query string `q`, i risultati vengono filtrati per titolo, artista o album.
 * - La ricerca è parziale e case-insensitive (`iLike`).
 *
 * @param req - Oggetto della richiesta HTTP, con query string opzionale `q`.
 * @param res - Oggetto della risposta HTTP.
 * @returns Risposta JSON con un array di brani.
 */
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
    console.error("Errore recupero brani:", error);
    factory.getStatusMessage(res, ErrorMessages.INTERNAL_ERROR.status, ErrorMessages.INTERNAL_ERROR.message);
  }
}

/**
 * Restituisce i 10 brani più acquistati nel sistema.
 *
 * - Calcola il numero totale di acquisti per ciascun brano.
 * - Include le informazioni principali del brano (titolo, artista, album, cover).
 * - Ordina i risultati per numero di acquisti in ordine decrescente.
 *
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @returns Risposta JSON con un array di oggetti: `track_id`, `num_acquisti`, e dettagli del brano.
 */
export async function getPopularTracks(req: Request, res: Response) {
  try {
    const topTracks = await Purchase.findAll({
      attributes: ["track_id", [fn("COUNT", col("track_id")), "num_acquisti"]],
      group: ["track_id", "Track.id"],
      include: [
        {
          model: Track,
          attributes: ["id", "titolo", "artista", "album", "cover_path"],
        },
      ],
      order: [[fn("COUNT", col("track_id")), "DESC"]],
      limit: 10,
    });

    res.json(topTracks);
  } catch (error) {
    console.error("Errore nel recupero dei brani popolari:", error);
    factory.getStatusMessage(res, ErrorMessages.INTERNAL_ERROR.status, ErrorMessages.INTERNAL_ERROR.message);
  }
}
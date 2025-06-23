import { Request, Response } from "express";
import { fn, col, Op } from "sequelize";
import { StatusCodes } from "http-status-codes";
import { MessageFactory } from "../utils/messageFactory";
import Track from "../models/Track";
import Purchase from "../models/Purchase";

const factory = new MessageFactory();

/**
 * Restituisce l’elenco di tutti i brani presenti nel sistema.
 *
 * - Se presente una query string `q`, filtra i risultati per titolo, artista o album.
 * - La ricerca è case-insensitive e parziale (`iLike`).
 *
 * @param req - Oggetto della richiesta HTTP. Può contenere il parametro `q` in `req.query`.
 * @param res - Oggetto della risposta HTTP.
 * @returns Un array di oggetti Track in formato JSON.
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
    factory.getStatusMessage(res, StatusCodes.INTERNAL_SERVER_ERROR, "Errore server durante il recupero dei brani");
  }
}

/**
 * Restituisce i 10 brani più acquistati.
 *
 * - Calcola il numero di acquisti per ciascun brano usando `Purchase`.
 * - Include le informazioni del brano (`titolo`, `artista`, `album`, `cover_path`).
 * - Ordina i risultati per numero di acquisti in ordine decrescente.
 *
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @returns Un array di oggetti con `track_id`, `num_acquisti` e i dati del brano associato.
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
    factory.getStatusMessage(res, StatusCodes.INTERNAL_SERVER_ERROR, "Errore server durante il recupero dei brani popolari");
  }
}
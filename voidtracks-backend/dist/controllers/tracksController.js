"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTracks = getAllTracks;
exports.getPopularTracks = getPopularTracks;
const sequelize_1 = require("sequelize");
const http_status_codes_1 = require("http-status-codes");
const messageFactory_1 = require("../utils/messageFactory");
const Track_1 = __importDefault(require("../models/Track"));
const Purchase_1 = __importDefault(require("../models/Purchase"));
const factory = new messageFactory_1.MessageFactory();
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
async function getAllTracks(req, res) {
    try {
        const query = req.query.q;
        let whereClause = {};
        if (query) {
            whereClause = {
                [sequelize_1.Op.or]: [
                    { titolo: { [sequelize_1.Op.iLike]: `%${query}%` } },
                    { artista: { [sequelize_1.Op.iLike]: `%${query}%` } },
                    { album: { [sequelize_1.Op.iLike]: `%${query}%` } },
                ],
            };
        }
        const tracks = await Track_1.default.findAll({ where: whereClause });
        res.json(tracks);
    }
    catch (error) {
        console.error("Errore recupero brani:", error);
        factory.getStatusMessage(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Errore server durante il recupero dei brani");
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
async function getPopularTracks(req, res) {
    try {
        const topTracks = await Purchase_1.default.findAll({
            attributes: ["track_id", [(0, sequelize_1.fn)("COUNT", (0, sequelize_1.col)("track_id")), "num_acquisti"]],
            group: ["track_id", "Track.id"],
            include: [
                {
                    model: Track_1.default,
                    attributes: ["id", "titolo", "artista", "album", "cover_path"],
                },
            ],
            order: [[(0, sequelize_1.fn)("COUNT", (0, sequelize_1.col)("track_id")), "DESC"]],
            limit: 10,
        });
        res.json(topTracks);
    }
    catch (error) {
        console.error("Errore nel recupero dei brani popolari:", error);
        factory.getStatusMessage(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Errore server durante il recupero dei brani popolari");
    }
}

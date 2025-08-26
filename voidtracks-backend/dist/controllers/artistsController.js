"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllArtists = getAllArtists;
exports.getArtistByName = getArtistByName;
const sequelize_1 = require("sequelize");
const errorMessages_1 = require("../utils/errorMessages");
const messageFactory_1 = require("../utils/messageFactory");
const Artist_1 = __importDefault(require("../models/Artist"));
const Track_1 = __importDefault(require("../models/Track"));
const factory = new messageFactory_1.MessageFactory();
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
async function getAllArtists(req, res, next) {
    try {
        const artists = await Artist_1.default.findAll();
        res.json(artists);
    }
    catch (error) {
        next(error);
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
async function getArtistByName(req, res, next) {
    const { nome } = req.params;
    try {
        const artist = await Artist_1.default.findOne({
            where: {
                nome: {
                    [sequelize_1.Op.iLike]: nome,
                },
            },
            include: [
                {
                    model: Track_1.default,
                    attributes: ["id", "titolo", "album", "music_path", "cover_path"],
                    through: { attributes: [] },
                },
            ],
        });
        if (!artist) {
            return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.ARTIST_NOT_FOUND.status, errorMessages_1.ErrorMessages.ARTIST_NOT_FOUND.message);
        }
        res.json(artist);
    }
    catch (error) {
        next(error);
    }
}

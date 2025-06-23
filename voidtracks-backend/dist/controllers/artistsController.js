"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllArtists = getAllArtists;
exports.getArtistByName = getArtistByName;
const sequelize_1 = require("sequelize");
const http_status_codes_1 = require("http-status-codes");
const messageFactory_1 = require("../utils/messageFactory");
const Artist_1 = __importDefault(require("../models/Artist"));
const Track_1 = __importDefault(require("../models/Track"));
const factory = new messageFactory_1.MessageFactory();
async function getAllArtists(req, res) {
    try {
        const artists = await Artist_1.default.findAll();
        res.json(artists);
    }
    catch (error) {
        console.error("Errore recupero artisti:", error);
        return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Errore durante il recupero degli artisti");
    }
}
async function getArtistByName(req, res) {
    const { nome } = req.params;
    try {
        const artist = await Artist_1.default.findOne({
            where: {
                nome: {
                    [sequelize_1.Op.iLike]: nome,
                },
            },
            include: [{
                    model: Track_1.default,
                    attributes: ['id', 'titolo', 'album', 'music_path', 'cover_path'],
                    through: { attributes: [] } // esclude dati della tabella di join
                }]
        });
        if (!artist) {
            return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.NOT_FOUND, "Artista non trovato");
        }
        res.json(artist);
    }
    catch (error) {
        console.error("Errore recupero artista per nome:", error);
        return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Errore durante il recupero dell'artista");
    }
}

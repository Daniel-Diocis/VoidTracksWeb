"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPlaylistOwnership = checkPlaylistOwnership;
exports.checkTrackIdInBody = checkTrackIdInBody;
exports.checkTrackOwnership = checkTrackOwnership;
exports.checkTrackNotInPlaylist = checkTrackNotInPlaylist;
exports.checkTrackIdParam = checkTrackIdParam;
exports.checkTrackIdInFavoriteBody = checkTrackIdInFavoriteBody;
const errorMessages_1 = require("../utils/errorMessages");
const messageFactory_1 = require("../utils/messageFactory");
const Playlist_1 = __importDefault(require("../models/Playlist"));
const Purchase_1 = __importDefault(require("../models/Purchase"));
const PlaylistTrack_1 = __importDefault(require("../models/PlaylistTrack"));
const factory = new messageFactory_1.MessageFactory();
/**
 * Verifica che la playlist appartenga all'utente autenticato.
 *
 * Aggiunge l'istanza della playlist a `req.playlist` se trovata.
 *
 * @param req - Oggetto della richiesta HTTP contenente l'ID della playlist.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Risposta 404 se la playlist non esiste o non appartiene all'utente.
 */
async function checkPlaylistOwnership(req, res, next) {
    const userId = req.user.id;
    const playlistId = parseInt(req.params.id, 10);
    const playlist = await Playlist_1.default.findOne({ where: { id: playlistId, user_id: userId } });
    if (!playlist) {
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.PLAYLIST_NOT_FOUND.status, errorMessages_1.ErrorMessages.PLAYLIST_NOT_FOUND.message);
    }
    req.playlist = playlist;
    next();
}
/**
 * Verifica la presenza del campo `track_id` nel body della richiesta.
 *
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Risposta 400 se `track_id` è mancante.
 */
function checkTrackIdInBody(req, res, next) {
    const { track_id } = req.body;
    if (!track_id) {
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.TRACK_ID_MISSING.status, errorMessages_1.ErrorMessages.TRACK_ID_MISSING.message);
    }
    next();
}
/**
 * Verifica che l'utente abbia acquistato il brano specificato.
 *
 * @param req - Oggetto della richiesta contenente `track_id` e `user.id`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Risposta 403 se il brano non è stato acquistato.
 */
async function checkTrackOwnership(req, res, next) {
    const userId = req.user.id;
    const { track_id } = req.body;
    const purchase = await Purchase_1.default.findOne({ where: { user_id: userId, track_id } });
    if (!purchase) {
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.TRACK_NOT_PURCHASED.status, errorMessages_1.ErrorMessages.TRACK_NOT_PURCHASED.message);
    }
    next();
}
/**
 * Verifica che il brano non sia già presente nella playlist.
 *
 * @param req - Oggetto della richiesta contenente `track_id` e `params.id`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Risposta 409 se il brano è già presente nella playlist.
 */
async function checkTrackNotInPlaylist(req, res, next) {
    const playlistId = parseInt(req.params.id, 10);
    const { track_id } = req.body;
    const existing = await PlaylistTrack_1.default.findOne({ where: { playlist_id: playlistId, track_id } });
    if (existing) {
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.TRACK_ALREADY_IN_PLAYLIST.status, errorMessages_1.ErrorMessages.TRACK_ALREADY_IN_PLAYLIST.message);
    }
    next();
}
/**
 * Verifica la presenza del parametro `trackId` nella richiesta.
 *
 * @param req - Oggetto della richiesta con parametro `trackId`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Risposta 400 se `trackId` è mancante.
 */
function checkTrackIdParam(req, res, next) {
    const trackId = req.params.trackId;
    if (!trackId) {
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.TRACK_ID_MISSING.status, errorMessages_1.ErrorMessages.TRACK_ID_MISSING.message);
    }
    next();
}
/**
 * Verifica la presenza del campo `trackId` nel body della richiesta (per setFavorite).
 *
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Risposta 400 se `trackId` è mancante.
 */
function checkTrackIdInFavoriteBody(req, res, next) {
    const { trackId } = req.body;
    if (!trackId) {
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.TRACK_ID_MISSING.status, errorMessages_1.ErrorMessages.TRACK_ID_MISSING.message);
    }
    next();
}

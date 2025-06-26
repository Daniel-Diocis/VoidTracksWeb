"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUserPlaylists = listUserPlaylists;
exports.createPlaylist = createPlaylist;
exports.getPlaylistWithTracks = getPlaylistWithTracks;
exports.deletePlaylist = deletePlaylist;
exports.renamePlaylist = renamePlaylist;
exports.addTrackToPlaylist = addTrackToPlaylist;
exports.removeTrackFromPlaylist = removeTrackFromPlaylist;
exports.setFavoriteTrack = setFavoriteTrack;
const http_status_codes_1 = require("http-status-codes");
const errorMessages_1 = require("../utils/errorMessages");
const messageFactory_1 = require("../utils/messageFactory");
const Playlist_1 = __importDefault(require("../models/Playlist"));
const PlaylistTrack_1 = __importDefault(require("../models/PlaylistTrack"));
const Track_1 = __importDefault(require("../models/Track"));
const factory = new messageFactory_1.MessageFactory();
/**
 * Restituisce tutte le playlist dell'utente autenticato.
 *
 * @param req - Oggetto della richiesta HTTP contenente l'ID utente.
 * @param res - Oggetto della risposta HTTP.
 */
async function listUserPlaylists(req, res) {
    try {
        const userId = req.user.id;
        const playlists = await Playlist_1.default.findAll({
            where: { user_id: userId },
            order: [["createdAt", "DESC"]],
        });
        res.json(playlists);
    }
    catch (error) {
        console.error("Errore nel recupero delle playlist:", error);
        factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INTERNAL_ERROR.status, errorMessages_1.ErrorMessages.INTERNAL_ERROR.message);
    }
}
/**
 * Crea una nuova playlist per l'utente autenticato.
 *
 * @param req - Oggetto della richiesta HTTP con `nome` nel body.
 * @param res - Oggetto della risposta HTTP.
 */
async function createPlaylist(req, res) {
    try {
        const userId = req.user.id;
        const { nome } = req.body;
        const nuovaPlaylist = await Playlist_1.default.create({ nome, user_id: userId });
        res.status(http_status_codes_1.StatusCodes.CREATED).json(nuovaPlaylist);
    }
    catch (error) {
        console.error("Errore creazione playlist:", error);
        factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INTERNAL_ERROR.status, errorMessages_1.ErrorMessages.INTERNAL_ERROR.message);
    }
}
/**
 * Restituisce una playlist con i brani associati.
 *
 * @param req - Oggetto della richiesta HTTP con `req.playlist` impostato dal middleware.
 * @param res - Oggetto della risposta HTTP.
 */
async function getPlaylistWithTracks(req, res) {
    try {
        const playlist = req.playlist;
        const playlistTracks = await PlaylistTrack_1.default.findAll({
            where: { playlist_id: playlist.id },
            include: [{ model: Track_1.default, attributes: ["id", "titolo", "artista", "album", "music_path", "cover_path"] }],
        });
        const tracks = playlistTracks
            .map((pt) => {
            if (!pt.Track)
                return null;
            const track = pt.Track;
            return {
                id: track.id,
                titolo: track.titolo,
                artista: track.artista,
                album: track.album,
                music_path: track.music_path,
                cover_path: track.cover_path,
                is_favorite: pt.is_favorite,
            };
        })
            .filter(Boolean);
        res.json({
            playlist: {
                id: playlist.id,
                nome: playlist.nome,
                createdAt: playlist.createdAt,
                updatedAt: playlist.updatedAt,
            },
            tracks,
        });
    }
    catch (error) {
        console.error("Errore nel recupero della playlist:", error);
        factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INTERNAL_ERROR.status, errorMessages_1.ErrorMessages.INTERNAL_ERROR.message);
    }
}
/**
 * Elimina una playlist esistente.
 *
 * @param req - Oggetto della richiesta HTTP con `req.playlist` impostato dal middleware.
 * @param res - Oggetto della risposta HTTP.
 */
async function deletePlaylist(req, res) {
    try {
        const playlist = req.playlist;
        await playlist.destroy();
        res.json({ message: "Playlist eliminata con successo" });
    }
    catch (error) {
        console.error("Errore eliminazione playlist:", error);
        factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INTERNAL_ERROR.status, errorMessages_1.ErrorMessages.INTERNAL_ERROR.message);
    }
}
/**
 * Rinomina una playlist esistente.
 *
 * @param req - Oggetto della richiesta HTTP con `req.playlist` e `nome` nel body.
 * @param res - Oggetto della risposta HTTP.
 */
async function renamePlaylist(req, res) {
    try {
        const playlist = req.playlist;
        const { nome } = req.body;
        playlist.nome = nome.trim();
        await playlist.save();
        res.json({ message: "Nome della playlist aggiornato con successo", playlist });
    }
    catch (error) {
        console.error("Errore durante la modifica della playlist:", error);
        factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INTERNAL_ERROR.status, errorMessages_1.ErrorMessages.INTERNAL_ERROR.message);
    }
}
/**
 * Aggiunge un brano acquistato alla playlist.
 *
 * @param req - Oggetto della richiesta HTTP con `track_id` nel body e `req.playlist` impostato dal middleware.
 * @param res - Oggetto della risposta HTTP.
 */
async function addTrackToPlaylist(req, res) {
    try {
        const playlist = req.playlist;
        const { track_id } = req.body;
        const nuovo = await PlaylistTrack_1.default.create({
            playlist_id: playlist.id,
            track_id,
            is_favorite: false,
        });
        res.status(http_status_codes_1.StatusCodes.CREATED).json({ message: "Brano aggiunto alla playlist", track: nuovo });
    }
    catch (error) {
        console.error("Errore aggiunta brano alla playlist:", error);
        factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INTERNAL_ERROR.status, errorMessages_1.ErrorMessages.INTERNAL_ERROR.message);
    }
}
/**
 * Rimuove un brano da una playlist.
 *
 * @param req - Oggetto della richiesta HTTP con `trackId` nei parametri e `req.playlist` impostato dal middleware.
 * @param res - Oggetto della risposta HTTP.
 */
async function removeTrackFromPlaylist(req, res) {
    try {
        const playlist = req.playlist;
        const trackId = req.params.trackId;
        await PlaylistTrack_1.default.destroy({ where: { playlist_id: playlist.id, track_id: trackId } });
        res.json({ message: "Brano rimosso dalla playlist" });
    }
    catch (error) {
        console.error("Errore rimozione brano dalla playlist:", error);
        factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INTERNAL_ERROR.status, errorMessages_1.ErrorMessages.INTERNAL_ERROR.message);
    }
}
/**
 * Imposta un brano come preferito nella playlist.
 *
 * @param req - Oggetto della richiesta HTTP con `trackId` nel body e `req.playlist` impostato dal middleware.
 * @param res - Oggetto della risposta HTTP.
 */
async function setFavoriteTrack(req, res) {
    try {
        const playlist = req.playlist;
        const { trackId } = req.body;
        await PlaylistTrack_1.default.update({ is_favorite: false }, { where: { playlist_id: playlist.id } });
        await PlaylistTrack_1.default.update({ is_favorite: true }, { where: { playlist_id: playlist.id, track_id: trackId } });
        res.json({ message: "Brano preferito aggiornato con successo" });
    }
    catch (error) {
        console.error("Errore aggiornamento brano preferito:", error);
        factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INTERNAL_ERROR.status, errorMessages_1.ErrorMessages.INTERNAL_ERROR.message);
    }
}

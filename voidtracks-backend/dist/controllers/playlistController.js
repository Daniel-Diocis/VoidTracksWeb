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
const messageFactory_1 = require("../utils/messageFactory");
const Playlist_1 = __importDefault(require("../models/Playlist"));
const PlaylistTrack_1 = __importDefault(require("../models/PlaylistTrack"));
const Purchase_1 = __importDefault(require("../models/Purchase"));
const Track_1 = __importDefault(require("../models/Track"));
const factory = new messageFactory_1.MessageFactory();
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
        factory.getStatusMessage(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Errore del server");
    }
}
async function createPlaylist(req, res) {
    try {
        const userId = req.user.id;
        const { nome } = req.body;
        if (!nome || typeof nome !== "string") {
            return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.BAD_REQUEST, "Nome playlist non valido");
        }
        const nuovaPlaylist = await Playlist_1.default.create({ nome, user_id: userId });
        res.status(http_status_codes_1.StatusCodes.CREATED).json(nuovaPlaylist);
    }
    catch (error) {
        console.error("Errore creazione playlist:", error);
        factory.getStatusMessage(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Errore del server");
    }
}
async function getPlaylistWithTracks(req, res) {
    try {
        const userId = req.user.id;
        const playlistId = parseInt(req.params.id, 10);
        const playlist = await Playlist_1.default.findOne({ where: { id: playlistId, user_id: userId } });
        if (!playlist) {
            return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.NOT_FOUND, "Playlist non trovata");
        }
        const playlistTracks = await PlaylistTrack_1.default.findAll({
            where: { playlist_id: playlistId },
            include: [{ model: Track_1.default, attributes: ["id", "titolo", "artista", "album", "cover_path"] }],
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
        factory.getStatusMessage(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Errore del server");
    }
}
async function deletePlaylist(req, res) {
    try {
        const userId = req.user.id;
        const playlistId = parseInt(req.params.id, 10);
        const playlist = await Playlist_1.default.findOne({ where: { id: playlistId, user_id: userId } });
        if (!playlist) {
            return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.NOT_FOUND, "Playlist non trovata o non autorizzato");
        }
        await playlist.destroy();
        res.json({ message: "Playlist eliminata con successo" });
    }
    catch (error) {
        console.error("Errore eliminazione playlist:", error);
        factory.getStatusMessage(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Errore del server");
    }
}
async function renamePlaylist(req, res) {
    try {
        const userId = req.user.id;
        const playlistId = parseInt(req.params.id, 10);
        const { nome } = req.body;
        if (!nome || nome.trim() === "") {
            return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.BAD_REQUEST, "Il nome della playlist è obbligatorio");
        }
        const playlist = await Playlist_1.default.findOne({ where: { id: playlistId, user_id: userId } });
        if (!playlist) {
            return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.NOT_FOUND, "Playlist non trovata o non autorizzato");
        }
        playlist.nome = nome.trim();
        await playlist.save();
        res.json({ message: "Nome della playlist aggiornato con successo", playlist });
    }
    catch (error) {
        console.error("Errore durante la modifica della playlist:", error);
        factory.getStatusMessage(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Errore del server");
    }
}
async function addTrackToPlaylist(req, res) {
    try {
        const userId = req.user.id;
        const playlistId = parseInt(req.params.id, 10);
        const { track_id } = req.body;
        if (!track_id) {
            return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.BAD_REQUEST, "ID del brano mancante");
        }
        const playlist = await Playlist_1.default.findOne({ where: { id: playlistId, user_id: userId } });
        if (!playlist) {
            return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.NOT_FOUND, "Playlist non trovata o non autorizzato");
        }
        const acquisto = await Purchase_1.default.findOne({ where: { user_id: userId, track_id } });
        if (!acquisto) {
            return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.FORBIDDEN, "Brano non acquistato");
        }
        const giàPresente = await PlaylistTrack_1.default.findOne({ where: { playlist_id: playlistId, track_id } });
        if (giàPresente) {
            return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.CONFLICT, "Brano già presente nella playlist");
        }
        const nuovo = await PlaylistTrack_1.default.create({ playlist_id: playlistId, track_id, is_favorite: false });
        res.status(http_status_codes_1.StatusCodes.CREATED).json({ message: "Brano aggiunto alla playlist", track: nuovo });
    }
    catch (error) {
        console.error("Errore aggiunta brano alla playlist:", error);
        factory.getStatusMessage(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Errore del server");
    }
}
async function removeTrackFromPlaylist(req, res) {
    try {
        const userId = req.user.id;
        const playlistId = parseInt(req.params.id, 10);
        const trackId = req.params.trackId;
        const playlist = await Playlist_1.default.findOne({ where: { id: playlistId, user_id: userId } });
        if (!playlist) {
            return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.NOT_FOUND, "Playlist non trovata o accesso negato");
        }
        const eliminato = await PlaylistTrack_1.default.destroy({ where: { playlist_id: playlistId, track_id: trackId } });
        if (eliminato === 0) {
            return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.NOT_FOUND, "Brano non trovato nella playlist");
        }
        res.json({ message: "Brano rimosso dalla playlist" });
    }
    catch (error) {
        console.error("Errore rimozione brano dalla playlist:", error);
        factory.getStatusMessage(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Errore del server");
    }
}
async function setFavoriteTrack(req, res) {
    try {
        const userId = req.user.id;
        const playlistId = parseInt(req.params.id, 10);
        const { trackId } = req.body;
        if (!trackId) {
            return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.BAD_REQUEST, "trackId mancante nel body");
        }
        const playlist = await Playlist_1.default.findOne({ where: { id: playlistId, user_id: userId } });
        if (!playlist) {
            return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.NOT_FOUND, "Playlist non trovata o accesso negato");
        }
        const entry = await PlaylistTrack_1.default.findOne({ where: { playlist_id: playlistId, track_id: trackId } });
        if (!entry) {
            return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.NOT_FOUND, "Brano non presente nella playlist");
        }
        await PlaylistTrack_1.default.update({ is_favorite: false }, { where: { playlist_id: playlistId } });
        await entry.update({ is_favorite: true });
        res.json({ message: "Brano preferito aggiornato con successo" });
    }
    catch (error) {
        console.error("Errore aggiornamento brano preferito:", error);
        factory.getStatusMessage(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Errore del server");
    }
}

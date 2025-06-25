"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateToken_1 = require("../middleware/authenticateToken");
const playlistMiddleware_1 = require("../middleware/playlistMiddleware");
const playlistController_1 = require("../controllers/playlistController");
const router = (0, express_1.Router)();
/**
 * @route GET /playlists
 * @summary Restituisce tutte le playlist dell'utente autenticato.
 * @controller listUserPlaylists
 */
router.get("/", authenticateToken_1.authenticateToken, playlistController_1.listUserPlaylists);
/**
 * @route POST /playlists
 * @summary Crea una nuova playlist per l'utente autenticato.
 * @controller createPlaylist
 */
router.post("/", authenticateToken_1.authenticateToken, playlistController_1.createPlaylist);
/**
 * @route GET /playlists/:id
 * @summary Restituisce i dettagli di una playlist e i suoi brani.
 * @middleware checkPlaylistOwnership - Verifica che la playlist appartenga all’utente.
 * @controller getPlaylistWithTracks
 */
router.get("/:id", authenticateToken_1.authenticateToken, playlistMiddleware_1.checkPlaylistOwnership, playlistController_1.getPlaylistWithTracks);
/**
 * @route DELETE /playlists/:id
 * @summary Elimina una playlist esistente.
 * @middleware checkPlaylistOwnership - Verifica che la playlist appartenga all’utente.
 * @controller deletePlaylist
 */
router.delete("/:id", authenticateToken_1.authenticateToken, playlistMiddleware_1.checkPlaylistOwnership, playlistController_1.deletePlaylist);
/**
 * @route PATCH /playlists/:id
 * @summary Rinomina una playlist.
 * @middleware checkPlaylistOwnership - Verifica che la playlist appartenga all’utente.
 * @controller renamePlaylist
 */
router.patch("/:id", authenticateToken_1.authenticateToken, playlistMiddleware_1.checkPlaylistOwnership, playlistController_1.renamePlaylist);
/**
 * @route POST /playlists/:id/tracks
 * @summary Aggiunge un brano a una playlist.
 *
 * @middleware checkPlaylistOwnership - Verifica proprietà della playlist.
 * @middleware checkTrackIdInBody - Verifica che `trackId` sia presente nel body.
 * @middleware checkTrackOwnership - Verifica che l’utente possieda il brano.
 * @middleware checkTrackNotInPlaylist - Verifica che il brano non sia già presente.
 * @controller addTrackToPlaylist
 */
router.post("/:id/tracks", authenticateToken_1.authenticateToken, playlistMiddleware_1.checkPlaylistOwnership, playlistMiddleware_1.checkTrackIdInBody, playlistMiddleware_1.checkTrackOwnership, playlistMiddleware_1.checkTrackNotInPlaylist, playlistController_1.addTrackToPlaylist);
/**
 * @route DELETE /playlists/:id/tracks/:trackId
 * @summary Rimuove un brano da una playlist.
 *
 * @middleware checkPlaylistOwnership - Verifica proprietà della playlist.
 * @middleware checkTrackIdParam - Valida `trackId` nel parametro URL.
 * @controller removeTrackFromPlaylist
 */
router.delete("/:id/tracks/:trackId", authenticateToken_1.authenticateToken, playlistMiddleware_1.checkPlaylistOwnership, playlistMiddleware_1.checkTrackIdParam, playlistController_1.removeTrackFromPlaylist);
/**
 * @route PATCH /playlists/:id/favorite
 * @summary Imposta un brano come preferito in una playlist.
 *
 * @middleware checkPlaylistOwnership - Verifica proprietà della playlist.
 * @middleware checkTrackIdInFavoriteBody - Valida `trackId` nel body.
 * @controller setFavoriteTrack
 */
router.patch("/:id/favorite", authenticateToken_1.authenticateToken, playlistMiddleware_1.checkPlaylistOwnership, playlistMiddleware_1.checkTrackIdInFavoriteBody, playlistController_1.setFavoriteTrack);
exports.default = router;

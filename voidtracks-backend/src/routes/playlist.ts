import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken";
import {
  checkPlaylistOwnership,
  checkTrackIdInBody,
  checkTrackOwnership,
  checkTrackNotInPlaylist,
  checkTrackIdParam,
  checkTrackIdInFavoriteBody,
} from "../middleware/playlistMiddleware";
import {
  listUserPlaylists,
  createPlaylist,
  getPlaylistWithTracks,
  deletePlaylist,
  renamePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  setFavoriteTrack,
} from "../controllers/playlistController";

const router = Router();

/**
 * @route GET /playlists
 * @summary Restituisce tutte le playlist dell'utente autenticato.
 * @controller listUserPlaylists
 */
router.get("/", authenticateToken, listUserPlaylists);

/**
 * @route POST /playlists
 * @summary Crea una nuova playlist per l'utente autenticato.
 * @controller createPlaylist
 */
router.post("/", authenticateToken, createPlaylist);

/**
 * @route GET /playlists/:id
 * @summary Restituisce i dettagli di una playlist e i suoi brani.
 * @middleware checkPlaylistOwnership - Verifica che la playlist appartenga all’utente.
 * @controller getPlaylistWithTracks
 */
router.get("/:id", authenticateToken, checkPlaylistOwnership, getPlaylistWithTracks);

/**
 * @route DELETE /playlists/:id
 * @summary Elimina una playlist esistente.
 * @middleware checkPlaylistOwnership - Verifica che la playlist appartenga all’utente.
 * @controller deletePlaylist
 */
router.delete("/:id", authenticateToken, checkPlaylistOwnership, deletePlaylist);

/**
 * @route PATCH /playlists/:id
 * @summary Rinomina una playlist.
 * @middleware checkPlaylistOwnership - Verifica che la playlist appartenga all’utente.
 * @controller renamePlaylist
 */
router.patch("/:id", authenticateToken, checkPlaylistOwnership, renamePlaylist);

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
router.post(
  "/:id/tracks",
  authenticateToken,
  checkPlaylistOwnership,
  checkTrackIdInBody,
  checkTrackOwnership,
  checkTrackNotInPlaylist,
  addTrackToPlaylist
);

/**
 * @route DELETE /playlists/:id/tracks/:trackId
 * @summary Rimuove un brano da una playlist.
 *
 * @middleware checkPlaylistOwnership - Verifica proprietà della playlist.
 * @middleware checkTrackIdParam - Valida `trackId` nel parametro URL.
 * @controller removeTrackFromPlaylist
 */
router.delete(
  "/:id/tracks/:trackId",
  authenticateToken,
  checkPlaylistOwnership,
  checkTrackIdParam,
  removeTrackFromPlaylist
);

/**
 * @route PATCH /playlists/:id/favorite
 * @summary Imposta un brano come preferito in una playlist.
 *
 * @middleware checkPlaylistOwnership - Verifica proprietà della playlist.
 * @middleware checkTrackIdInFavoriteBody - Valida `trackId` nel body.
 * @controller setFavoriteTrack
 */
router.patch(
  "/:id/favorite",
  authenticateToken,
  checkPlaylistOwnership,
  checkTrackIdInFavoriteBody,
  setFavoriteTrack
);

export default router;
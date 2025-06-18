import { Router } from 'express';
import { authenticateToken } from '../middleware/authenticateToken';
import {
  listUserPlaylists,
  createPlaylist,
  getPlaylistWithTracks,
  deletePlaylist,
  renamePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  setFavoriteTrack
} from '../controllers/playlistController';

const router = Router();

router.get('/', authenticateToken, listUserPlaylists);
router.post('/', authenticateToken, createPlaylist);
router.get('/:id', authenticateToken, getPlaylistWithTracks);
router.delete('/:id', authenticateToken, deletePlaylist);
router.patch('/:id', authenticateToken, renamePlaylist);
router.post('/:id/tracks', authenticateToken, addTrackToPlaylist);
router.delete('/:id/tracks/:trackId', authenticateToken, removeTrackFromPlaylist);
router.patch('/:id/favorite', authenticateToken, setFavoriteTrack);

export default router;
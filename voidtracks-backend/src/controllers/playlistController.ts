import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ErrorMessages } from "../utils/errorMessages";
import { MessageFactory } from "../utils/messageFactory";
import Playlist from "../models/Playlist";
import PlaylistTrack from "../models/PlaylistTrack";
import Track from "../models/Track";

const factory = new MessageFactory();

/**
 * Restituisce tutte le playlist dell'utente autenticato.
 *
 * @param req - Oggetto della richiesta HTTP contenente l'ID utente.
 * @param res - Oggetto della risposta HTTP.
 */
export async function listUserPlaylists(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const playlists = await Playlist.findAll({
      where: { user_id: userId },
      order: [["createdAt", "DESC"]],
    });
    res.json(playlists);
  } catch (error) {
    console.error("Errore nel recupero delle playlist:", error);
    factory.getStatusMessage(res, ErrorMessages.INTERNAL_ERROR.status, ErrorMessages.INTERNAL_ERROR.message);
  }
}

/**
 * Crea una nuova playlist per l'utente autenticato.
 *
 * @param req - Oggetto della richiesta HTTP con `nome` nel body.
 * @param res - Oggetto della risposta HTTP.
 */
export async function createPlaylist(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { nome } = req.body;

    const nuovaPlaylist = await Playlist.create({ nome, user_id: userId });
    res.status(StatusCodes.CREATED).json(nuovaPlaylist);
  } catch (error) {
    console.error("Errore creazione playlist:", error);
    factory.getStatusMessage(res, ErrorMessages.INTERNAL_ERROR.status, ErrorMessages.INTERNAL_ERROR.message);
  }
}

/**
 * Restituisce una playlist con i brani associati.
 *
 * @param req - Oggetto della richiesta HTTP con `req.playlist` impostato dal middleware.
 * @param res - Oggetto della risposta HTTP.
 */
export async function getPlaylistWithTracks(req: Request, res: Response) {
  try {
    const playlist = (req as any).playlist;

    const playlistTracks = await PlaylistTrack.findAll({
      where: { playlist_id: playlist.id },
      include: [{ model: Track, attributes: ["id", "titolo", "artista", "album", "music_path", "cover_path"] }],
    });

    const tracks = playlistTracks
      .map((pt) => {
        if (!pt.Track) return null;
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
  } catch (error) {
    console.error("Errore nel recupero della playlist:", error);
    factory.getStatusMessage(res, ErrorMessages.INTERNAL_ERROR.status, ErrorMessages.INTERNAL_ERROR.message);
  }
}

/**
 * Elimina una playlist esistente.
 *
 * @param req - Oggetto della richiesta HTTP con `req.playlist` impostato dal middleware.
 * @param res - Oggetto della risposta HTTP.
 */
export async function deletePlaylist(req: Request, res: Response) {
  try {
    const playlist = (req as any).playlist;
    await playlist.destroy();
    res.json({ message: "Playlist eliminata con successo" });
  } catch (error) {
    console.error("Errore eliminazione playlist:", error);
    factory.getStatusMessage(res, ErrorMessages.INTERNAL_ERROR.status, ErrorMessages.INTERNAL_ERROR.message);
  }
}

/**
 * Rinomina una playlist esistente.
 *
 * @param req - Oggetto della richiesta HTTP con `req.playlist` e `nome` nel body.
 * @param res - Oggetto della risposta HTTP.
 */
export async function renamePlaylist(req: Request, res: Response) {
  try {
    const playlist = (req as any).playlist;
    const { nome } = req.body;

    playlist.nome = nome.trim();
    await playlist.save();

    res.json({ message: "Nome della playlist aggiornato con successo", playlist });
  } catch (error) {
    console.error("Errore durante la modifica della playlist:", error);
    factory.getStatusMessage(res, ErrorMessages.INTERNAL_ERROR.status, ErrorMessages.INTERNAL_ERROR.message);
  }
}

/**
 * Aggiunge un brano acquistato alla playlist.
 *
 * @param req - Oggetto della richiesta HTTP con `track_id` nel body e `req.playlist` impostato dal middleware.
 * @param res - Oggetto della risposta HTTP.
 */
export async function addTrackToPlaylist(req: Request, res: Response) {
  try {
    const playlist = (req as any).playlist;
    const { track_id } = req.body;

    const nuovo = await PlaylistTrack.create({
      playlist_id: playlist.id,
      track_id,
      is_favorite: false,
    });

    res.status(StatusCodes.CREATED).json({ message: "Brano aggiunto alla playlist", track: nuovo });
  } catch (error) {
    console.error("Errore aggiunta brano alla playlist:", error);
    factory.getStatusMessage(res, ErrorMessages.INTERNAL_ERROR.status, ErrorMessages.INTERNAL_ERROR.message);
  }
}

/**
 * Rimuove un brano da una playlist.
 *
 * @param req - Oggetto della richiesta HTTP con `trackId` nei parametri e `req.playlist` impostato dal middleware.
 * @param res - Oggetto della risposta HTTP.
 */
export async function removeTrackFromPlaylist(req: Request, res: Response) {
  try {
    const playlist = (req as any).playlist;
    const trackId = req.params.trackId;

    await PlaylistTrack.destroy({ where: { playlist_id: playlist.id, track_id: trackId } });
    res.json({ message: "Brano rimosso dalla playlist" });
  } catch (error) {
    console.error("Errore rimozione brano dalla playlist:", error);
    factory.getStatusMessage(res, ErrorMessages.INTERNAL_ERROR.status, ErrorMessages.INTERNAL_ERROR.message);
  }
}

/**
 * Imposta un brano come preferito nella playlist.
 *
 * @param req - Oggetto della richiesta HTTP con `trackId` nel body e `req.playlist` impostato dal middleware.
 * @param res - Oggetto della risposta HTTP.
 */
export async function setFavoriteTrack(req: Request, res: Response) {
  try {
    const playlist = (req as any).playlist;
    const { trackId } = req.body;

    await PlaylistTrack.update({ is_favorite: false }, { where: { playlist_id: playlist.id } });
    await PlaylistTrack.update({ is_favorite: true }, { where: { playlist_id: playlist.id, track_id: trackId } });

    res.json({ message: "Brano preferito aggiornato con successo" });
  } catch (error) {
    console.error("Errore aggiornamento brano preferito:", error);
    factory.getStatusMessage(res, ErrorMessages.INTERNAL_ERROR.status, ErrorMessages.INTERNAL_ERROR.message);
  }
}
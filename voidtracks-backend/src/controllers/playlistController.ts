import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { MessageFactory } from "../utils/messageFactory";
import Playlist from "../models/Playlist";
import PlaylistTrack from "../models/PlaylistTrack";
import Purchase from "../models/Purchase";
import Track from "../models/Track";

const factory = new MessageFactory();

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
    factory.getStatusMessage(res, StatusCodes.INTERNAL_SERVER_ERROR, "Errore del server");
  }
}

export async function createPlaylist(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { nome } = req.body;

    if (!nome || typeof nome !== "string") {
      return factory.getStatusMessage(res, StatusCodes.BAD_REQUEST, "Nome playlist non valido");
    }

    const nuovaPlaylist = await Playlist.create({ nome, user_id: userId });
    res.status(StatusCodes.CREATED).json(nuovaPlaylist);
  } catch (error) {
    console.error("Errore creazione playlist:", error);
    factory.getStatusMessage(res, StatusCodes.INTERNAL_SERVER_ERROR, "Errore del server");
  }
}

export async function getPlaylistWithTracks(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const playlistId = parseInt(req.params.id, 10);

    const playlist = await Playlist.findOne({ where: { id: playlistId, user_id: userId } });
    if (!playlist) {
      return factory.getStatusMessage(res, StatusCodes.NOT_FOUND, "Playlist non trovata");
    }

    const playlistTracks = await PlaylistTrack.findAll({
      where: { playlist_id: playlistId },
      include: [{ model: Track, attributes: ["id", "titolo", "artista", "album", "cover_path"] }],
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
    factory.getStatusMessage(res, StatusCodes.INTERNAL_SERVER_ERROR, "Errore del server");
  }
}

export async function deletePlaylist(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const playlistId = parseInt(req.params.id, 10);

    const playlist = await Playlist.findOne({ where: { id: playlistId, user_id: userId } });
    if (!playlist) {
      return factory.getStatusMessage(res, StatusCodes.NOT_FOUND, "Playlist non trovata o non autorizzato");
    }

    await playlist.destroy();
    res.json({ message: "Playlist eliminata con successo" });
  } catch (error) {
    console.error("Errore eliminazione playlist:", error);
    factory.getStatusMessage(res, StatusCodes.INTERNAL_SERVER_ERROR, "Errore del server");
  }
}

export async function renamePlaylist(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const playlistId = parseInt(req.params.id, 10);
    const { nome } = req.body;

    if (!nome || nome.trim() === "") {
      return factory.getStatusMessage(res, StatusCodes.BAD_REQUEST, "Il nome della playlist è obbligatorio");
    }

    const playlist = await Playlist.findOne({ where: { id: playlistId, user_id: userId } });
    if (!playlist) {
      return factory.getStatusMessage(res, StatusCodes.NOT_FOUND, "Playlist non trovata o non autorizzato");
    }

    playlist.nome = nome.trim();
    await playlist.save();

    res.json({ message: "Nome della playlist aggiornato con successo", playlist });
  } catch (error) {
    console.error("Errore durante la modifica della playlist:", error);
    factory.getStatusMessage(res, StatusCodes.INTERNAL_SERVER_ERROR, "Errore del server");
  }
}

export async function addTrackToPlaylist(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const playlistId = parseInt(req.params.id, 10);
    const { track_id } = req.body;

    if (!track_id) {
      return factory.getStatusMessage(res, StatusCodes.BAD_REQUEST, "ID del brano mancante");
    }

    const playlist = await Playlist.findOne({ where: { id: playlistId, user_id: userId } });
    if (!playlist) {
      return factory.getStatusMessage(res, StatusCodes.NOT_FOUND, "Playlist non trovata o non autorizzato");
    }

    const acquisto = await Purchase.findOne({ where: { user_id: userId, track_id } });
    if (!acquisto) {
      return factory.getStatusMessage(res, StatusCodes.FORBIDDEN, "Brano non acquistato");
    }

    const giàPresente = await PlaylistTrack.findOne({ where: { playlist_id: playlistId, track_id } });
    if (giàPresente) {
      return factory.getStatusMessage(res, StatusCodes.CONFLICT, "Brano già presente nella playlist");
    }

    const nuovo = await PlaylistTrack.create({ playlist_id: playlistId, track_id, is_favorite: false });
    res.status(StatusCodes.CREATED).json({ message: "Brano aggiunto alla playlist", track: nuovo });
  } catch (error) {
    console.error("Errore aggiunta brano alla playlist:", error);
    factory.getStatusMessage(res, StatusCodes.INTERNAL_SERVER_ERROR, "Errore del server");
  }
}

export async function removeTrackFromPlaylist(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const playlistId = parseInt(req.params.id, 10);
    const trackId = req.params.trackId;

    const playlist = await Playlist.findOne({ where: { id: playlistId, user_id: userId } });
    if (!playlist) {
      return factory.getStatusMessage(res, StatusCodes.NOT_FOUND, "Playlist non trovata o accesso negato");
    }

    const eliminato = await PlaylistTrack.destroy({ where: { playlist_id: playlistId, track_id: trackId } });
    if (eliminato === 0) {
      return factory.getStatusMessage(res, StatusCodes.NOT_FOUND, "Brano non trovato nella playlist");
    }

    res.json({ message: "Brano rimosso dalla playlist" });
  } catch (error) {
    console.error("Errore rimozione brano dalla playlist:", error);
    factory.getStatusMessage(res, StatusCodes.INTERNAL_SERVER_ERROR, "Errore del server");
  }
}

export async function setFavoriteTrack(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const playlistId = parseInt(req.params.id, 10);
    const { trackId } = req.body;

    if (!trackId) {
      return factory.getStatusMessage(res, StatusCodes.BAD_REQUEST, "trackId mancante nel body");
    }

    const playlist = await Playlist.findOne({ where: { id: playlistId, user_id: userId } });
    if (!playlist) {
      return factory.getStatusMessage(res, StatusCodes.NOT_FOUND, "Playlist non trovata o accesso negato");
    }

    const entry = await PlaylistTrack.findOne({ where: { playlist_id: playlistId, track_id: trackId } });
    if (!entry) {
      return factory.getStatusMessage(res, StatusCodes.NOT_FOUND, "Brano non presente nella playlist");
    }

    await PlaylistTrack.update({ is_favorite: false }, { where: { playlist_id: playlistId } });
    await entry.update({ is_favorite: true });

    res.json({ message: "Brano preferito aggiornato con successo" });
  } catch (error) {
    console.error("Errore aggiornamento brano preferito:", error);
    factory.getStatusMessage(res, StatusCodes.INTERNAL_SERVER_ERROR, "Errore del server");
  }
}
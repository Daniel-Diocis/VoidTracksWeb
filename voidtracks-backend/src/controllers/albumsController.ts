import { Request, Response, NextFunction } from "express";
import Track from "../models/Track";

/**
 * Restituisce tutti gli album distinti ricavati dal campo `album` dei brani.
 */
export async function listAlbums(req: Request, res: Response, next: NextFunction) {
  try {
    const tracks = await Track.findAll({
      attributes: ["album", "artista", "cover_path"],
      order: [["album", "ASC"]],
    });

    const albumsMap = new Map<string, {
      album: string;
      artista: string;
      cover_path: string;
    }>();

    tracks.forEach((track) => {
      if (!albumsMap.has(track.album)) {
        albumsMap.set(track.album, {
          album: track.album,
          artista: track.artista,
          cover_path: track.cover_path,
        });
      }
    });

    res.json(Array.from(albumsMap.values()));
  } catch (error) {
    next(error);
  }
}

/**
 * Restituisce tutti i brani appartenenti a un album.
 */
export async function getAlbumTracks(req: Request, res: Response, next: NextFunction) {
  try {
    const albumName = decodeURIComponent(req.params.albumName);

    const tracks = await Track.findAll({
      where: { album: albumName },
      order: [["titolo", "ASC"]],
    });

    res.json({
      album: albumName,
      tracks,
    });
  } catch (error) {
    next(error);
  }
}
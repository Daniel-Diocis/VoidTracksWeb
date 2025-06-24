import { Request, Response, NextFunction } from "express";
import { ErrorMessages } from "../utils/errorMessages";
import { MessageFactory } from "../utils/messageFactory";
import Playlist from "../models/Playlist";
import Purchase from "../models/Purchase";
import PlaylistTrack from "../models/PlaylistTrack";

const factory = new MessageFactory();

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
export async function checkPlaylistOwnership(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user.id;
  const playlistId = parseInt(req.params.id, 10);

  const playlist = await Playlist.findOne({ where: { id: playlistId, user_id: userId } });
  if (!playlist) {
    return factory.getStatusMessage(res, ErrorMessages.PLAYLIST_NOT_FOUND.status, ErrorMessages.PLAYLIST_NOT_FOUND.message);
  }

  (req as any).playlist = playlist;
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
export function checkTrackIdInBody(req: Request, res: Response, next: NextFunction) {
  const { track_id } = req.body;

  if (!track_id) {
    return factory.getStatusMessage(res, ErrorMessages.TRACK_ID_MISSING.status, ErrorMessages.TRACK_ID_MISSING.message);
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
export async function checkTrackOwnership(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user.id;
  const { track_id } = req.body;

  const purchase = await Purchase.findOne({ where: { user_id: userId, track_id } });
  if (!purchase) {
    return factory.getStatusMessage(res, ErrorMessages.TRACK_NOT_PURCHASED.status, ErrorMessages.TRACK_NOT_PURCHASED.message);
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
export async function checkTrackNotInPlaylist(req: Request, res: Response, next: NextFunction) {
  const playlistId = parseInt(req.params.id, 10);
  const { track_id } = req.body;

  const existing = await PlaylistTrack.findOne({ where: { playlist_id: playlistId, track_id } });
  if (existing) {
    return factory.getStatusMessage(res, ErrorMessages.TRACK_ALREADY_IN_PLAYLIST.status, ErrorMessages.TRACK_ALREADY_IN_PLAYLIST.message);
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
export function checkTrackIdParam(req: Request, res: Response, next: NextFunction) {
  const trackId = req.params.trackId;

  if (!trackId) {
    return factory.getStatusMessage(res, ErrorMessages.TRACK_ID_MISSING.status, ErrorMessages.TRACK_ID_MISSING.message);
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
export function checkTrackIdInFavoriteBody(req: Request, res: Response, next: NextFunction) {
  const { trackId } = req.body;

  if (!trackId) {
    return factory.getStatusMessage(res, ErrorMessages.TRACK_ID_MISSING.status, ErrorMessages.TRACK_ID_MISSING.message);
  }

  next();
}
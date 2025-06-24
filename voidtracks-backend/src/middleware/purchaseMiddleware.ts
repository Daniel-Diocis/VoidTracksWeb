import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { StatusCodes } from "http-status-codes";
import { ErrorMessages } from "../utils/errorMessages";
import { MessageFactory } from "../utils/messageFactory";
import User from "../models/User";
import Track from "../models/Track";
import Purchase from "../models/Purchase";

const factory = new MessageFactory();

/**
 * Valida il corpo della richiesta per l'acquisto.
 *
 * Verifica che `track_id` sia presente e sia una stringa.
 *
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Risposta 400 se `track_id` è mancante o non valido.
 */
export function validatePurchaseBody(req: Request, res: Response, next: NextFunction) {
  const { track_id } = req.body;
  if (!track_id || typeof track_id !== "string") {
    return factory.getStatusMessage(
      res,
      ErrorMessages.TRACK_ID_VALIDATE.status,
      ErrorMessages.TRACK_ID_VALIDATE.message
    );
  }
  next();
}

/**
 * Verifica l'esistenza dell'utente e del brano nel database.
 *
 * Aggiunge `userInstance` e `trackInstance` all'oggetto `req`.
 *
 * @param req - Oggetto della richiesta HTTP contenente `user.id` e `track_id`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Risposta 404 se utente o brano non esistono.
 */
export async function checkUserAndTrackExist(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user.id;
  const { track_id } = req.body;

  const user = await User.findByPk(userId);
  const track = await Track.findByPk(track_id);

  if (!user) {
    return factory.getStatusMessage(res, ErrorMessages.USER_NOT_FOUND.status, ErrorMessages.USER_NOT_FOUND.message);
  }

  if (!track) {
    return factory.getStatusMessage(res, ErrorMessages.TRACK_NOT_FOUND.status, ErrorMessages.TRACK_NOT_FOUND.message);
  }

  (req as any).userInstance = user;
  (req as any).trackInstance = track;
  next();
}

/**
 * Verifica se esiste già un acquisto valido per lo stesso utente e brano.
 *
 * Se esistente, restituisce il token esistente ed evita la duplicazione.
 *
 * @param req - Oggetto della richiesta contenente `user.id` e `track_id`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Risposta 200 con il token già valido se presente.
 */
export async function checkDuplicatePurchase(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user.id;
  const { track_id } = req.body;

  const existingPurchase = await Purchase.findOne({
    where: {
      user_id: userId,
      track_id,
      used_flag: false,
      valid_until: { [Op.gt]: new Date() },
    },
  });

  if (existingPurchase) {
    return res.status(StatusCodes.OK).json({
      message: "Acquisto già presente e valido",
      purchase_id: existingPurchase.id,
      download_token: existingPurchase.download_token,
    });
  }

  next();
}

/**
 * Verifica che l'utente disponga di un numero sufficiente di token.
 *
 * Confronta i token dell'utente con il costo del brano.
 *
 * @param req - Oggetto della richiesta contenente `userInstance` e `trackInstance`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Risposta 401 se i token disponibili non sono sufficienti.
 */
export function checkUserTokens(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).userInstance;
  const track = (req as any).trackInstance;

  if (user.tokens < track.costo) {
    return factory.getStatusMessage(res, ErrorMessages.UNSUFFICIENT_TOKENS.status, ErrorMessages.UNSUFFICIENT_TOKENS.message);
  }

  next();
}

/**
 * Valida il token di download fornito come parametro.
 *
 * Verifica che il token:
 * - Esista
 * - Non sia già stato usato
 * - Non sia scaduto
 *
 * Aggiunge `purchaseInstance` a `req` se valido.
 *
 * @param req - Oggetto della richiesta contenente `download_token` nei parametri.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Risposta 404, 403 o successo.
 */
export async function validateDownloadToken(req: Request, res: Response, next: NextFunction) {
  const { download_token } = req.params;

  const purchase = await Purchase.findOne({
    where: { download_token },
    include: [Track],
  });

  if (!purchase) {
    return factory.getStatusMessage(res, ErrorMessages.INVALID_LINK.status, ErrorMessages.INVALID_LINK.message);
  }

  if (purchase.used_flag) {
    return factory.getStatusMessage(res, ErrorMessages.ALREADY_USED_LINK.status, ErrorMessages.ALREADY_USED_LINK.message);
  }

  if (new Date() > purchase.valid_until) {
    return factory.getStatusMessage(res, ErrorMessages.EXPIRED_LINK.status, ErrorMessages.EXPIRED_LINK.message);
  }

  (req as any).purchaseInstance = purchase;
  next();
}

/**
 * Carica i dettagli dell'acquisto tramite `download_token` senza verificarne la validità.
 *
 * Utile per consultare i dettagli associati al token.
 *
 * @param req - Oggetto della richiesta contenente `download_token` nei parametri.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Risposta 404 se il token è invalido o non associato a un brano.
 */
export async function loadPurchaseByToken(req: Request, res: Response, next: NextFunction) {
  const { download_token } = req.params;

  const purchase = await Purchase.findOne({
    where: { download_token },
    include: [Track],
  });

  if (!purchase || !purchase.Track) {
    return factory.getStatusMessage(res, ErrorMessages.INVALID_PURCHASE_TOKEN.status, ErrorMessages.INVALID_PURCHASE_TOKEN.message);
  }

  (req as any).purchaseInstance = purchase;
  next();
}
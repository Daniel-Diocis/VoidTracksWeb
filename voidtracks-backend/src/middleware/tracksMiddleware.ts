import { Request, Response, NextFunction } from "express";
import { ErrorMessages } from "../utils/errorMessages";
import { MessageFactory } from "../utils/messageFactory";

const factory = new MessageFactory();

/**
 * Valida il parametro di query `q` per la ricerca dei brani.
 *
 * Se presente, verifica che sia una stringa.
 *
 * @param req - Oggetto della richiesta HTTP contenente `req.query.q`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Risposta 400 se `q` non è una stringa.
 */
export function validateTrackQuery(req: Request, res: Response, next: NextFunction) {
  const q = req.query.q;
  if (q && typeof q !== "string") {
    return factory.getStatusMessage(res, ErrorMessages.Q_NOT_STRING.status, ErrorMessages.Q_NOT_STRING.message);
  }
  next();
}

/**
 * Registra nel log la query di ricerca dei brani, se presente.
 *
 * Utile per il tracciamento e debug delle richieste al servizio tracce.
 *
 * @param req - Oggetto della richiesta HTTP.
 * @param _res - Oggetto della risposta HTTP (non utilizzato).
 * @param next - Funzione per passare al middleware successivo.
 */
export function logTrackRequest(req: Request, _res: Response, next: NextFunction) {
  if (req.query.q) {
    console.log(`[Tracks] Ricerca per query: "${req.query.q}"`);
  }
  next();
}
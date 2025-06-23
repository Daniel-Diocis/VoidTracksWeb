import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { MessageFactory } from "../utils/messageFactory";

const factory = new MessageFactory();

/**
 * Middleware di validazione per il parametro `q` della query string.
 *
 * - Verifica che, se presente, `q` sia una stringa.
 * - In caso contrario, restituisce un errore HTTP 400.
 *
 * @param req - Oggetto della richiesta HTTP contenente `req.query.q`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
export function validateTrackQuery(req: Request, res: Response, next: NextFunction) {
  const q = req.query.q;
  if (q && typeof q !== "string") {
    return factory.getStatusMessage(res, StatusCodes.BAD_REQUEST, "Il parametro 'q' deve essere una stringa");
  }
  next();
}

/**
 * Middleware di logging per le ricerche di brani.
 *
 * - Se è presente una query `q`, stampa in console il valore cercato.
 * - Utile per monitorare le richieste effettuate al controller dei brani.
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
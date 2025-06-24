import { Request, Response, NextFunction } from "express";
import { ErrorMessages } from "../utils/errorMessages";
import { MessageFactory } from "../utils/messageFactory";

const factory = new MessageFactory();

/**
 * Middleware di validazione del parametro `nome` per la ricerca artista.
 *
 * - Controlla che `nome` sia una stringa non vuota e non composta solo da spazi.
 * - In caso di valore non valido, restituisce un errore 400 con messaggio coerente.
 *
 * @param req - Oggetto della richiesta HTTP contenente `req.params.nome`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
export function validateArtistName(req: Request, res: Response, next: NextFunction) {
  const { nome } = req.params;

  if (!nome || typeof nome !== "string" || nome.trim().length === 0) {
    return factory.getStatusMessage(res, ErrorMessages.INVALID_ARTIST_NAME.status, ErrorMessages.INVALID_ARTIST_NAME.message);
  }

  next();
}
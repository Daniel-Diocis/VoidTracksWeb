import { Request, Response, NextFunction } from "express";
import { ErrorMessages } from "../utils/errorMessages";
import { MessageFactory } from "../utils/messageFactory";

const factory = new MessageFactory();

/**
 * Middleware di validazione per la ricarica dei token da parte dell’admin.
 *
 * - Verifica che `username` sia una stringa non vuota.
 * - Verifica che `tokens` sia un numero maggiore o uguale a zero.
 * - In caso di input non valido, restituisce un errore 400 con messaggio standardizzato.
 *
 * @param req - Oggetto della richiesta HTTP contenente `username` e `tokens` nel body
 * @param res - Oggetto della risposta HTTP
 * @param next - Funzione per passare al middleware successivo
 */
export function validateRechargeInput(req: Request, res: Response, next: NextFunction) {
  const { username, tokens } = req.body;

  if (!username || typeof username !== "string" || typeof tokens !== "number" || tokens < 0) {
    return factory.getStatusMessage(res, ErrorMessages.INVALID_RECHARGE_INPUT.status, ErrorMessages.INVALID_RECHARGE_INPUT.message);
  }

  next();
}

/**
 * Middleware di validazione per il numero di token da accreditare a una richiesta approvata.
 *
 * - Verifica che `tokensToAdd` sia un numero valido ≥ 0.
 * - Utilizzato prima dell’approvazione di una richiesta da parte dell’admin.
 *
 * @param req - Oggetto della richiesta HTTP contenente `tokensToAdd` nel body
 * @param res - Oggetto della risposta HTTP
 * @param next - Funzione per passare al middleware successivo
 */
export function validateTokenAmount(req: Request, res: Response, next: NextFunction) {
  const { tokensToAdd } = req.body;

  if (typeof tokensToAdd !== "number" || tokensToAdd < 0) {
    return factory.getStatusMessage(res, ErrorMessages.INVALID_INPUT.status, ErrorMessages.INVALID_INPUT.message);
  }

  next();
}
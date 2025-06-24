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
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
export function validateRechargeInput(req: Request, res: Response, next: NextFunction) {
  const { username, tokens } = req.body;

  if (
    !username ||
    typeof username !== "string" ||
    typeof tokens !== "number" ||
    tokens < 0
  ) {
    return factory.getStatusMessage(res, ErrorMessages.INVALID_RECHARGE_INPUT.status, ErrorMessages.INVALID_RECHARGE_INPUT.message);
  }

  next();
}
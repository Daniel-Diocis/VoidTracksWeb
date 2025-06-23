import { Response } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

/**
 * Invia una risposta di errore HTTP standardizzata.
 *
 * @param res - Oggetto Response di Express
 * @param statusCode - Codice di stato HTTP (es. StatusCodes.BAD_REQUEST)
 * @param message - Messaggio personalizzato aggiuntivo opzionale
 */
export function sendError(res: Response, statusCode: number, message?: string) {
  const statusKey = Object.keys(StatusCodes).find(
    (key) => StatusCodes[key as keyof typeof StatusCodes] === statusCode
  ) as keyof typeof ReasonPhrases;

  const reasonPhrase = ReasonPhrases[statusKey] || "Errore";
  const errorMessage = message ? `${reasonPhrase}: ${message}` : reasonPhrase;

  return res.status(statusCode).json({ error: errorMessage });
}

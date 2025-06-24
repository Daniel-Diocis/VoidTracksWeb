import { Response } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

/**
 * Factory per la generazione centralizzata di messaggi di errore HTTP.
 *
 * Fornisce un metodo per restituire risposte JSON con codici di stato coerenti
 * e messaggi descrittivi, combinando le costanti `StatusCodes` e `ReasonPhrases`.
 */
export class MessageFactory {
  /**
   * Restituisce una risposta JSON con il codice di stato e un messaggio formattato.
   *
   * - Se fornito, `message` viene concatenato alla frase standard HTTP per maggiore chiarezza.
   * - In caso contrario, viene utilizzata solo la frase standard (es. "Bad Request").
   *
   * @param res - Oggetto `Response` di Express.
   * @param statusCode - Codice di stato HTTP da restituire.
   * @param message - Messaggio opzionale da includere nella risposta.
   * @returns L'oggetto `Response` con status e JSON del messaggio.
   */
  getStatusMessage(res: Response, statusCode: number, message?: string) {
    const statusKey = Object.keys(StatusCodes).find(
      key => StatusCodes[key as keyof typeof StatusCodes] === statusCode
    ) as keyof typeof ReasonPhrases;

    const reasonPhrase = ReasonPhrases[statusKey] || "Errore";
    const errorMessage = message ? `${reasonPhrase}: ${message}` : reasonPhrase;

    return res.status(statusCode).json({ error: errorMessage });
  }
}
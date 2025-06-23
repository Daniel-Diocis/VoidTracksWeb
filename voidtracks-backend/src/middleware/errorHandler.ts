import { Request, Response, NextFunction } from "express";

/**
 * Middleware globale per la gestione degli errori.
 *
 * - Cattura tutti gli errori non gestiti e restituisce un messaggio generico.
 * - Se presente, usa `err.status` per impostare il codice HTTP.
 *
 * @param err - Oggetto errore catturato.
 * @param _req - Oggetto della richiesta (non utilizzato).
 * @param res - Oggetto della risposta HTTP.
 * @param _next - Funzione next (non utilizzata).
 * @returns Risposta HTTP con messaggio d’errore.
 */
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
    },
  });
}
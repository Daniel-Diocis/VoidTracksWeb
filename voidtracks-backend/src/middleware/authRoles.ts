import { Request, Response, NextFunction } from "express";
import { ErrorMessages } from "../utils/errorMessages";
import { MessageFactory } from "../utils/messageFactory";

const factory = new MessageFactory();

/**
 * Middleware per verificare l’autenticazione dell’utente.
 *
 * - Controlla che l’oggetto `req.user` sia presente (inserito da `authenticateToken`).
 * - In caso contrario, restituisce errore HTTP 401 (Unauthorized).
 *
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
export function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = (req as any).user;
  if (!user) {
    return factory.getStatusMessage(res, ErrorMessages.NOT_USER.status, "Accesso negato. Login richiesto.");
  }
  next();
}

/**
 * Middleware per autorizzare solo gli utenti con ruolo `admin`.
 *
 * - Verifica che l’utente sia autenticato.
 * - Verifica che il campo `role` dell’utente sia `admin`.
 * - In caso contrario, restituisce errore HTTP 403 (Forbidden).
 *
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
export function authenticateAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = (req as any).user;
  if (!user) {
    return factory.getStatusMessage(res, ErrorMessages.NOT_USER.status, ErrorMessages.NOT_USER.message);
  }

  if (user.role !== "admin") {
    return factory.getStatusMessage(res, ErrorMessages.NOT_ADMIN.status, ErrorMessages.NOT_ADMIN.message);
  }

  next();
}
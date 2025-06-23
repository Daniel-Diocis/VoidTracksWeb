import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { MessageFactory } from "../utils/messageFactory";

const factory = new MessageFactory();

// Middleware per verificare che l'utente sia autenticato
export function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = (req as any).user;
  if (!user) {
    return factory.getStatusMessage(res, StatusCodes.UNAUTHORIZED, "Accesso negato. Login richiesto.");
  }
  next();
}

// Middleware per verificare che l'utente sia autenticato e abbia ruolo admin
export function authenticateAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = (req as any).user;
  if (!user) {
    return factory.getStatusMessage(res, StatusCodes.UNAUTHORIZED, "Accesso negato. Login richiesto.");
  }

  if (user.role !== "admin") {
    return factory.getStatusMessage(res, StatusCodes.FORBIDDEN, "Privilegi insufficienti.");
  }

  next();
}
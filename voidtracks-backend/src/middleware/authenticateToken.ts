import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { MessageFactory } from "../utils/messageFactory";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";


interface JwtPayload {
  id: number;
  username: string;
  role: string;
  tokens: number;
}

// Legge la chiave pubblica da file
const publicKeyPath = process.env.PUBLIC_KEY_PATH || "public.key";
const publicKey = fs.readFileSync(path.resolve(publicKeyPath), "utf8");

const factory = new MessageFactory();

/**
 * Middleware di autenticazione basato su JWT.
 *
 * - Verifica la presenza e la validità del token nell'header Authorization.
 * - Se il token è valido, aggiunge il payload decodificato all’oggetto `req`.
 *
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Risposta 401 se il token è mancante o non valido.
 */
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return factory.getStatusMessage(res, StatusCodes.UNAUTHORIZED, "Token mancante");
  }

  jwt.verify(token, publicKey, { algorithms: ["RS256"] }, (err, payload) => {
    if (err) {
      return factory.getStatusMessage(res, StatusCodes.UNAUTHORIZED, "Token non valido o scaduto");
    }

    (req as any).user = payload as JwtPayload;
    next();
  });
}
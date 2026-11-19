import { Request, Response, NextFunction } from "express";
import { ErrorMessages } from "../utils/errorMessages";
import { MessageFactory } from "../utils/messageFactory";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { createHash, createPublicKey } from "node:crypto";


interface JwtPayload {
  id: number;
  username: string;
  role: string;
  tokens: number;
}

// Legge la chiave pubblica da file
const publicKeyPath = process.env.PUBLIC_KEY_PATH || "public.key";
const publicKey = process.env.JWT_PUBLIC_KEY_BASE64
  ? Buffer.from(process.env.JWT_PUBLIC_KEY_BASE64, "base64").toString("utf8")
  : fs.readFileSync(path.resolve(publicKeyPath), "utf8");

export function usesDemoSigningKey(): boolean {
  const der = createPublicKey(publicKey).export({ type: "spki", format: "der" });
  return createHash("sha256").update(der).digest("hex") ===
    "19472f9acecf7d21a14ec664cca667c1640e04e422feabd004dcad14233d4c30";
}

const factory = new MessageFactory();

/**
 * Middleware di autenticazione JWT.
 *
 * Questo middleware verifica la presenza e la validità del token JWT fornito
 * nell'header `Authorization` delle richieste HTTP.
 *
 * Se il token è valido:
 * - Decodifica il payload e lo assegna a `req.user`.
 * - Prosegue al middleware successivo.
 *
 * In caso di token mancante o non valido:
 * - Risponde con codice 401 Unauthorized e un messaggio descrittivo.
 *
 * @param req - Oggetto della richiesta HTTP (Express).
 * @param res - Oggetto della risposta HTTP (Express).
 * @param next - Funzione che richiama il middleware successivo.
 * @returns Risposta HTTP 401 in caso di assenza o invalidità del token.
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return factory.getStatusMessage(res, ErrorMessages.MISSING_TOKEN.status, ErrorMessages.MISSING_TOKEN.message);
  }

  jwt.verify(token, publicKey, { algorithms: ["RS256"] }, (err, payload) => {
    if (err) {
      return factory.getStatusMessage(res, ErrorMessages.INVALID_TOKEN.status, ErrorMessages.INVALID_TOKEN.message);
    }

    (req as any).user = payload as JwtPayload;
    next();
  });
}

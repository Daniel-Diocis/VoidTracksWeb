import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

interface JwtPayload {
  id: number;
  username: string;
  role: string;
  tokens: number;
}

// Legge la chiave pubblica da file (puoi farlo una volta sola per performance)
const publicKeyPath = process.env.PUBLIC_KEY_PATH || "public.key";
const publicKey = fs.readFileSync(path.resolve(publicKeyPath), "utf8");

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token mancante" });
  }

  jwt.verify(token, publicKey, { algorithms: ["RS256"] }, (err, payload) => {
    if (err) {
      return res.status(401).json({ error: "Token non valido o scaduto" });
    }

    (req as any).user = payload as JwtPayload;
    next();
  });
}

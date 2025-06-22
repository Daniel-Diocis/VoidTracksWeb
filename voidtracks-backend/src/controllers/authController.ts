import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import fs from "fs";

const privateKey = fs.readFileSync(
  process.env.PRIVATE_KEY_PATH || "./private.key",
  "utf8"
);

// Register: creazione dell'utente e JWT
export async function register(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    // Hash e crea utente
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      username,
      password_hash,
      tokens: 10,
      role: "user",
    });

    const token = jwt.sign(
      {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        tokens: newUser.tokens,
      },
      privateKey,
      {
        algorithm: "RS256",
        expiresIn: "1h",
      }
    );

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        tokens: newUser.tokens,
      },
    });
  } catch (error) {
    console.error("Errore registrazione:", error);
    return res.status(500).json({ error: "Errore del server" });
  }
}

// Login: generi token e risposta
export async function login(req: Request, res: Response) {
  try {
    const user = (req as any).userRecord;  // user aggiunto nel middleware checkUserCredentials

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        tokens: user.tokens,
      },
      privateKey,
      {
        algorithm: "RS256",
        expiresIn: "1h",
      }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        tokens: user.tokens,
      },
    });
  } catch (error) {
    console.error("Errore login:", error);
    return res.status(500).json({ error: "Errore del server" });
  }
}

// Restituisce dati utente aggiornati da dailyTokenBonus middleware
export async function getPrivateUser(req: Request, res: Response) {
  const user = (req as any).userRecord;

  res.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      tokens: user.tokens,
    },
  });
}

export function logout(req: Request, res: Response) {
  return res.json({ message: "Logout eseguito con successo" });
}
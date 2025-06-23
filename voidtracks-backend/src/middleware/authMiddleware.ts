import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { body, validationResult } from 'express-validator';
import bcrypt from "bcryptjs";
import { toZonedTime, format } from "date-fns-tz";

const timeZone = "Europe/Rome";

/**
 * Middleware di validazione per `username` e `password`.
 *
 * - Controlla che lo username abbia almeno 3 caratteri.
 * - Controlla che la password abbia almeno 6 caratteri.
 * - In caso di errore, restituisce un array di messaggi.
 */
export const validateAuthInput = [
  body('username')
    .trim()
    .isLength({ min: 3 }).withMessage('Username obbligatorio, almeno 3 caratteri'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password obbligatoria, almeno 6 caratteri'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * Middleware di controllo per la registrazione.
 *
 * - Verifica che lo username non sia già presente nel database.
 * - In caso di conflitto, restituisce errore 409.
 *
 * @param req - Oggetto della richiesta HTTP contenente `username`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
export async function checkUserExists(req: Request, res: Response, next: NextFunction) {
  try {
    const { username } = req.body;
    const user = await User.findOne({ where: { username } });
    if (user) {
      return res.status(409).json({ error: "Username già in uso" });
    }
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware di autenticazione per il login.
 *
 * - Verifica che lo username esista.
 * - Confronta la password fornita con l’hash salvato nel DB.
 * - Se valido, aggiunge l’utente completo a `req.userRecord`.
 *
 * @param req - Oggetto della richiesta HTTP contenente `username` e `password`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
export async function checkUserCredentials(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: "Credenziali non valide" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenziali non valide" });
    }

    (req as any).userRecord = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware per assegnare un token bonus giornaliero.
 *
 * - Controlla se l’utente ha già ricevuto il bonus nella data corrente.
 * - Se non ancora assegnato, incrementa il numero di token e aggiorna la data.
 * - Aggiorna `req.userRecord` con l’utente aggiornato.
 *
 * @param req - Oggetto della richiesta HTTP con `user` allegato dal middleware `authenticateToken`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
export async function dailyTokenBonus(req: Request, res: Response, next: NextFunction) {
  try {
    const userPayload = (req as any).user;
    if (!userPayload) {
      return res.status(401).json({ error: "Utente non autenticato" });
    }

    const user = await User.findByPk(userPayload.id);
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    const now = new Date();
    const lastBonusDate = user.lastTokenBonusDate;

    const lastBonusDay = lastBonusDate
      ? format(toZonedTime(lastBonusDate, timeZone), "yyyy-MM-dd")
      : null;
    const today = format(toZonedTime(now, timeZone), "yyyy-MM-dd");

    if (lastBonusDay !== today) {
      user.tokens += 1;
      user.lastTokenBonusDate = now;
      await user.save();
    }

    (req as any).userRecord = user;

    next();
  } catch (error) {
    next(error);
  }
}
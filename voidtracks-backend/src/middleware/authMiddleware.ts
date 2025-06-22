import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { body, validationResult } from 'express-validator';
import bcrypt from "bcryptjs";
import { toZonedTime, format } from "date-fns-tz";

const timeZone = "Europe/Rome";

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

// Controlla che username non sia già usato (per registrazione)
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

// Controlla che username esista e password corrisponda (per login)
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

// Bonus token giornaliero
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
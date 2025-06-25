import { Request, Response, NextFunction } from "express";
import { body, validationResult } from 'express-validator';
import { toZonedTime, format } from "date-fns-tz";
import { StatusCodes } from "http-status-codes";
import { ErrorMessages } from "../utils/errorMessages";
import { MessageFactory } from "../utils/messageFactory";
import User from "../models/User";
import Notification from "../models/Notification";
import bcrypt from "bcryptjs";

const timeZone = "Europe/Rome";
const factory = new MessageFactory();
/**
 * Middleware di validazione per i campi `username` e `password`.
 *
 * - Verifica che lo username abbia almeno 3 caratteri.
 * - Verifica che la password abbia almeno 6 caratteri.
 * - In caso di errore, restituisce una risposta 400 con dettagli sugli errori.
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
      return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * Middleware di verifica per la registrazione utente.
 *
 * - Controlla se lo username esiste già nel database.
 * - In caso positivo, restituisce errore HTTP 409 (Conflict).
 *
 * @param req - Oggetto della richiesta contenente il campo `username`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
export async function checkUserExists(req: Request, res: Response, next: NextFunction) {
  const { username } = req.body;
  const user = await User.findOne({ where: { username } });
  if (user) {
    return factory.getStatusMessage(res, ErrorMessages.USERNAME_ALREADY_EXISTS.status, ErrorMessages.USERNAME_ALREADY_EXISTS.message);
  }
  next();
}

/**
 * Middleware di autenticazione per il login utente.
 *
 * - Verifica l’esistenza dello username.
 * - Confronta la password fornita con l’hash memorizzato nel DB.
 * - Se le credenziali sono valide, assegna l’oggetto utente a `req.userRecord`.
 *
 * @param req - Oggetto della richiesta contenente `username` e `password`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
export async function checkUserCredentials(req: Request, res: Response, next: NextFunction) {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user) {
    return factory.getStatusMessage(res, ErrorMessages.INVALID_CREDENTIALS.status, ErrorMessages.INVALID_CREDENTIALS.message);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    return factory.getStatusMessage(res, ErrorMessages.INVALID_CREDENTIALS.status, ErrorMessages.INVALID_CREDENTIALS.message);
  }

  (req as any).userRecord = user;
  next();
}

/**
 * Middleware per l’assegnazione del bonus giornaliero di 1 token.
 *
 * - Verifica se l’utente ha già ricevuto il bonus nella data corrente (fuso orario: Europe/Rome).
 * - In caso negativo, incrementa i token dell’utente e aggiorna `lastTokenBonusDate`.
 * - L’oggetto utente aggiornato viene assegnato a `req.userRecord`.
 *
 * @param req - Oggetto della richiesta contenente `user` da `authenticateToken`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
export async function dailyTokenBonus(req: Request, res: Response, next: NextFunction) {
  const userPayload = (req as any).user;
  if (!userPayload) {
    return factory.getStatusMessage(res, ErrorMessages.NOT_AUTHENTICATED_USER.status, ErrorMessages.NOT_AUTHENTICATED_USER.message);
  }

  const user = await User.findByPk(userPayload.id);
  if (!user) {
    return factory.getStatusMessage(res, ErrorMessages.USER_NOT_FOUND.status, ErrorMessages.USER_NOT_FOUND.message);
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
}

export async function checkNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return next();

    const notifications = await Notification.findAll({
      where: { user_id: userId, seen: false },
      order: [["created_at", "DESC"]],
      include: [{ model: User, as: "user" }],
    });

    (req as any).unreadNotifications = notifications;
    console.log("Notifiche non lette trovate:", notifications.map(n => n.message));
    next();
  } catch (err) {
    console.error("Errore nel recupero notifiche:", err);
    next(); // non bloccare la chain
  }
}
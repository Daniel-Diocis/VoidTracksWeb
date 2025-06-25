import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ErrorMessages } from "../utils/errorMessages";
import { MessageFactory } from "../utils/messageFactory";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Notification from "../models/Notification";
import fs from "fs";

const privateKey = fs.readFileSync(
  process.env.PRIVATE_KEY_PATH || "./private.key",
  "utf8"
);
const factory = new MessageFactory();

/**
 * Registra un nuovo utente nel sistema.
 *
 * - Hasha la password ricevuta in input.
 * - Crea un nuovo record utente con 10 token e ruolo "user".
 * - Genera un token JWT firmato e lo restituisce insieme ai dati utente.
 *
 * @param req - Oggetto della richiesta HTTP, contenente `username` e `password` nel body.
 * @param res - Oggetto della risposta HTTP.
 * @returns Risposta HTTP con il token JWT e i dati dell’utente appena creato.
 */
export async function register(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

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

    return res.status(StatusCodes.CREATED).json({
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
    return factory.getStatusMessage(res, ErrorMessages.INTERNAL_ERROR.status, ErrorMessages.INTERNAL_ERROR.message);
  }
}

/**
 * Effettua il login di un utente.
 *
 * - Presuppone che il middleware `checkUserCredentials` abbia verificato le credenziali
 *   e allegato l'utente a `req.userRecord`.
 * - Genera un token JWT e restituisce i dati dell’utente.
 *
 * @param req - Oggetto della richiesta HTTP con `userRecord` settato dal middleware.
 * @param res - Oggetto della risposta HTTP.
 * @returns Risposta HTTP con il token JWT e i dati dell’utente autenticato.
 */
export async function login(req: Request, res: Response) {
  try {
    const user = (req as any).userRecord;

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
    return factory.getStatusMessage(res, ErrorMessages.INTERNAL_ERROR.status, ErrorMessages.INTERNAL_ERROR.message);
  }
}

/**
 * Restituisce i dati dell’utente autenticato.
 *
 * - Presuppone che i middleware `verifyToken` e (opzionalmente) `dailyTokenBonus`
 *   abbiano allegato l’oggetto utente aggiornato a `req.userRecord`.
 *
 * @param req - Oggetto della richiesta HTTP contenente `userRecord`.
 * @param res - Oggetto della risposta HTTP.
 * @returns Risposta HTTP con i dati aggiornati dell’utente.
 */
export async function getPrivateUser(req: Request, res: Response) {
  try {
    const user = (req as any).userRecord;
    const unreadNotifications = (req as any).unreadNotifications || [];

    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        tokens: user.tokens,
      },
      notifications: unreadNotifications,
    });
  } catch (error) {
    console.error("Errore nel recupero dell’utente:", error);
    return factory.getStatusMessage(
      res,
      ErrorMessages.INTERNAL_ERROR.status,
      ErrorMessages.INTERNAL_ERROR.message
    );
  }
}

export async function markNotificationsAsSeen(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return factory.getStatusMessage(
        res,
        ErrorMessages.NOT_AUTHENTICATED_USER.status,
        ErrorMessages.NOT_AUTHENTICATED_USER.message
      );
    }

    await Notification.update(
      { seen: true },
      { where: { user_id: userId, seen: false } }
    );

    return res.sendStatus(StatusCodes.NO_CONTENT); // 204
  } catch (err) {
    console.error("Errore nel marcare notifiche come lette:", err);
    return factory.getStatusMessage(
      res,
      ErrorMessages.INTERNAL_ERROR.status,
      ErrorMessages.INTERNAL_ERROR.message
    );
  }
}
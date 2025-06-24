import { Request, Response } from "express";
import { ErrorMessages } from "../utils/errorMessages";
import { MessageFactory } from "../utils/messageFactory";
import User from "../models/User";

const factory = new MessageFactory();

/**
 * Controller per ricaricare i token di un utente.
 *
 * - Presuppone che `username` e `tokens` siano già stati validati da un middleware precedente.
 * - Cerca l'utente tramite username e aggiorna il numero di token.
 *
 * @param req - Oggetto della richiesta HTTP contenente `username` e `tokens` nel body.
 * @param res - Oggetto della risposta HTTP.
 * @returns Risposta JSON con messaggio di conferma e nuovo saldo token, oppure errore.
 */
export async function rechargeTokens(req: Request, res: Response) {
  const { username, tokens } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return factory.getStatusMessage(res, ErrorMessages.USER_NOT_FOUND.status, ErrorMessages.USER_NOT_FOUND.message);
    }

    user.tokens = tokens;
    await user.save();

    res.json({
      message: `Ricarica completata per ${user.username}`,
      tokens: user.tokens,
    });
  } catch (err) {
    console.error("Errore ricarica token:", err);
    return factory.getStatusMessage(res, ErrorMessages.INTERNAL_ERROR.status, ErrorMessages.INTERNAL_ERROR.message);
  }
}
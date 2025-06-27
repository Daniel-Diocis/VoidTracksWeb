import { Request, Response, NextFunction } from "express";
import { ErrorMessages } from "../utils/errorMessages";
import { MessageFactory } from "../utils/messageFactory";
import User from "../models/User";
import RequestModel from "../models/Request";
import RequestVote from "../models/RequestVote";
import Notification from "../models/Notification";
import { Op } from "sequelize";

const factory = new MessageFactory();

/**
 * Ricarica il numero di token di un utente specificato tramite username.
 *
 * - Il middleware precedente valida `username` e `tokens`.
 * - Se l’utente esiste, aggiorna il saldo token.
 *
 * @param req - Richiesta HTTP con `username` e `tokens` nel body.
 * @param res - Risposta JSON con conferma e nuovo saldo token, oppure errore.
 */
export async function rechargeTokens(req: Request, res: Response, next: NextFunction) {
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
  } catch (error) {
    next(error);
  }
}

/**
 * Restituisce tutte le richieste in attesa di approvazione.
 *
 * - Include l’username dell’utente che ha effettuato la richiesta.
 * - Conta i voti ricevuti da ciascuna richiesta.
 *
 * @param req - Richiesta HTTP dell’admin.
 * @param res - Risposta JSON con lista delle richieste in stato "waiting".
 */
export async function getPendingRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const requests = await RequestModel.findAll({
      where: { status: "waiting" },
      include: [
        {
          model: User,
          attributes: ["username"]
        },
        {
          model: RequestVote,
          attributes: ["user_id"],
          as: "votes"
        }
      ],
      order: [["created_at", "DESC"]]
    });

    const formatted = requests.map(r => ({
      id: r.id,
      brano: r.brano,
      artista: r.artista,
      tokens: r.tokens,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: (r as any).User?.username || "utente sconosciuto",
      voti: (r as any).votes?.length || 0
    }));

    return res.json(formatted);
  } catch (error) {
    next(error);
  }
}

/**
 * Approva una richiesta e accredita token all’utente che l’ha creata.
 *
 * - Cambia lo stato della richiesta in "satisfied".
 * - Aggiunge token all’utente creatore.
 * - Invia notifiche all’utente creatore e a tutti i votanti (eccetto il creatore stesso).
 *
 * @param req - Richiesta HTTP con `tokensToAdd` nel body.
 * @param res - Risposta JSON con messaggio di successo o errore.
 */
export async function approveRequest(req: Request, res: Response, next: NextFunction) {
  const request = res.locals.request as RequestModel;
  const { tokensToAdd } = req.body;

  try {
    await request.update({ status: "satisfied", tokens: tokensToAdd });

    const creator = await User.findByPk(request.user_id);
    if (creator) {
      creator.tokens += tokensToAdd;
      await creator.save();

      await Notification.create({
        user_id: creator.id,
        message: `La tua richiesta per "${request.brano}" di ${request.artista} è stata approvata. +${tokensToAdd} token accreditati!`,
        seen: false
      });
    }

    const votes = await RequestVote.findAll({ where: { request_id: request.id } });
    const voterIds = votes.map(v => v.user_id).filter(id => id !== request.user_id);

    const notifications = voterIds.map(user_id => ({
      user_id,
      message: `La richiesta per "${request.brano}" di ${request.artista} che hai votato è stata approvata!`,
      seen: false
    }));

    await Notification.bulkCreate(notifications);

    return res.json({ message: "Richiesta approvata, token accreditati, notifiche inviate" });
  } catch (error) {
    next(error);
  }
}

/**
 * Rifiuta una richiesta impostandone lo stato su "rejected".
 *
 * @param _req - Richiesta HTTP (non usata).
 * @param res - Risposta JSON con messaggio di conferma o errore.
 */
export const rejectRequest = async (_req: Request, res: Response, next: NextFunction) => {
  const request = res.locals.request as RequestModel;

  try {
    await request.update({ status: "rejected" });
    return res.json({ message: "Richiesta rifiutata con successo" });
  } catch (error) {
    next(error);
  }
};
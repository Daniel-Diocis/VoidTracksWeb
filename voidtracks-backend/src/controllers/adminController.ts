import { Request, Response } from "express";
import { ErrorMessages } from "../utils/errorMessages";
import { MessageFactory } from "../utils/messageFactory";
import User from "../models/User";
import RequestModel from "../models/Request";
import RequestVote from "../models/RequestVote";
import Notification from "../models/Notification";
import { Op } from "sequelize";

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

/**
 * Restituisce tutte le richieste con status "waiting" per l'admin.
 *
 * - Include l'username dell'utente che ha fatto la richiesta.
 * - Conta i voti ricevuti da ciascuna richiesta.
 *
 * @route GET /admin/requests
 */
export async function getPendingRequests(req: Request, res: Response) {
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
          as: "votes"  // <-- usa lo stesso alias definito in `Request.hasMany(...)`
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
  } catch (err) {
    console.error("Errore fetch richieste pendenti:", err);
    return factory.getStatusMessage(
      res,
      ErrorMessages.INTERNAL_ERROR.status,
      ErrorMessages.INTERNAL_ERROR.message
    );
  }
}

/**
 * Approva una richiesta impostandone lo stato su "satisfied".
 */
export async function approveRequest(req: Request, res: Response) {
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
  } catch (err) {
    console.error("Errore approvazione richiesta:", err);
    return factory.getStatusMessage(
      res,
      ErrorMessages.INTERNAL_ERROR.status,
      ErrorMessages.INTERNAL_ERROR.message
    );
  }
}

/**
 * Rifiuta una richiesta impostandone lo stato su "rejected".
 */
export const rejectRequest = async (_req: Request, res: Response) => {
  const request = res.locals.request as RequestModel;

  try {
    await request.update({ status: "rejected" });
    return res.json({ message: "Richiesta rifiutata con successo" });
  } catch (err) {
    console.error("Errore rifiuto richiesta:", err);
    return factory.getStatusMessage(res, ErrorMessages.INTERNAL_ERROR.status, ErrorMessages.INTERNAL_ERROR.message);
  }
};
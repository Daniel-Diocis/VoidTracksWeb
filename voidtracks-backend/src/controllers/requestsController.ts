import { Request, Response } from "express";
import { Request as RequestModel, RequestVote } from "../db";
import { ErrorMessages } from "../utils/errorMessages";
import { MessageFactory } from "../utils/messageFactory";
import User from "../models/User";

const factory = new MessageFactory();

/**
 * Restituisce tutte le richieste in stato "waiting", con numero voti e flag `hasVoted`.
 *
 * - Ordina i risultati per numero di voti decrescente.
 * - Include un flag `hasVoted` se l’utente loggato ha già votato quella richiesta.
 *
 * @param req - Oggetto della richiesta HTTP con `user.id`.
 * @param res - Risposta JSON con lista delle richieste e relativi voti.
 */
export async function getAllRequests(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    const requests = await RequestModel.findAll({
      where: { status: "waiting" },
      include: [{ model: RequestVote, as: "votes" }],
    });

    const userVotes = await RequestVote.findAll({
      where: { user_id: userId },
      attributes: ["request_id"],
    });

    const votedRequestIds = new Set(userVotes.map((v) => v.request_id));

    const data = requests
      .map((r) => ({
        id: r.id,
        brano: r.brano,
        artista: r.artista,
        status: r.status,
        tokens: r.tokens,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        voti: (r as any).votes?.length || 0,
        hasVoted: votedRequestIds.has(r.id),
      }))
      .sort((a, b) => b.voti - a.voti);

    res.json(data);
  } catch (error) {
    console.error("Errore nel recupero richieste:", error);
    factory.getStatusMessage(res, ErrorMessages.INTERNAL_ERROR.status, ErrorMessages.INTERNAL_ERROR.message);
  }
}

/**
 * Crea una nuova richiesta per un brano da parte dell’utente loggato.
 *
 * - Richiede `brano` e `artista` nel body.
 * - Scala 3 token all’utente richiedente.
 *
 * @param req - Oggetto della richiesta HTTP con `user.id`, `brano` e `artista`.
 * @param res - Risposta JSON con la richiesta creata.
 */
export async function createRequest(req: Request, res: Response) {
  try {
    const { brano, artista } = req.body;
    const userToken = (req as any).user;
    const dbUser = await User.findByPk(userToken.id);

    if (!dbUser) {
      return factory.getStatusMessage(
        res,
        ErrorMessages.USER_NOT_FOUND.status,
        "Utente non trovato"
      );
    }

    const newRequest = await RequestModel.create({
      brano,
      artista,
      user_id: dbUser.id,
    });

    dbUser.tokens -= 3;
    await dbUser.save();

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Errore nella creazione richiesta:", error);
    factory.getStatusMessage(res, ErrorMessages.INTERNAL_ERROR.status, ErrorMessages.INTERNAL_ERROR.message);
  }
}

/**
 * Aggiunge un voto a una richiesta specifica da parte dell’utente autenticato.
 *
 * @param req - Oggetto della richiesta HTTP con `user.id` e `req.params.id`.
 * @param res - Risposta JSON con messaggio di conferma.
 */
export async function voteRequest(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const requestId = Number(req.params.id);

    await RequestVote.create({ user_id: userId, request_id: requestId });

    res.status(201).json({ message: "Voto aggiunto" });
  } catch (error) {
    console.error("Errore durante l'aggiunta del voto:", error);
    factory.getStatusMessage(res, ErrorMessages.INTERNAL_ERROR.status, ErrorMessages.INTERNAL_ERROR.message);
  }
}

/**
 * Rimuove il voto dell’utente autenticato da una richiesta specifica.
 *
 * @param req - Oggetto della richiesta HTTP con `user.id` e `req.params.id`.
 * @param res - Risposta JSON con messaggio di conferma.
 */
export async function unvoteRequest(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const requestId = Number(req.params.id);

    await RequestVote.destroy({
      where: { user_id: userId, request_id: requestId },
    });

    res.json({ message: "Voto rimosso" });
  } catch (error) {
    console.error("Errore durante la rimozione del voto:", error);
    factory.getStatusMessage(res, ErrorMessages.INTERNAL_ERROR.status, ErrorMessages.INTERNAL_ERROR.message);
  }
}
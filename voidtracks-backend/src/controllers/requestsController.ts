import { Request, Response } from "express";
import { Request as RequestModel, RequestVote } from "../db";
import { ErrorMessages } from "../utils/errorMessages";
import { MessageFactory } from "../utils/messageFactory";

const factory = new MessageFactory();

/**
 * Restituisce tutte le richieste con i voti associati, ordinate per numero di voti.
 */
export async function getAllRequests(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    // Ottieni tutte le richieste in stato 'waiting' con i voti
    const requests = await RequestModel.findAll({
      where: { status: "waiting" },
      include: [{ model: RequestVote, as: "votes" }],
    });

    // Recupera gli ID delle richieste votate dall’utente loggato
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
        hasVoted: votedRequestIds.has(r.id), // 👈 Aggiunto campo
      }))
      .sort((a, b) => b.voti - a.voti);

    res.json(data);
  } catch (error) {
    console.error("Errore nel recupero richieste:", error);
    factory.getStatusMessage(
      res,
      ErrorMessages.INTERNAL_ERROR.status,
      ErrorMessages.INTERNAL_ERROR.message
    );
  }
}

/**
 * Crea una nuova richiesta e scala i token all'utente.
 */
export async function createRequest(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { brano, artista } = req.body;

    const newRequest = await RequestModel.create({
      brano,
      artista,
      user_id: user.id,
    });

    await user.update({ tokens: user.tokens - 3 });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Errore nella creazione richiesta:", error);
    factory.getStatusMessage(
      res,
      ErrorMessages.INTERNAL_ERROR.status,
      ErrorMessages.INTERNAL_ERROR.message
    );
  }
}

/**
 * Aggiunge un voto a una richiesta da parte di un utente.
 */
export async function voteRequest(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const requestId = Number(req.params.id);

    await RequestVote.create({ user_id: userId, request_id: requestId });

    res.status(201).json({ message: "Voto aggiunto" });
  } catch (error) {
    console.error("Errore durante l'aggiunta del voto:", error);
    factory.getStatusMessage(
      res,
      ErrorMessages.INTERNAL_ERROR.status,
      ErrorMessages.INTERNAL_ERROR.message
    );
  }
}

/**
 * Rimuove un voto da una richiesta da parte di un utente.
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
    factory.getStatusMessage(
      res,
      ErrorMessages.INTERNAL_ERROR.status,
      ErrorMessages.INTERNAL_ERROR.message
    );
  }
}
import { Request, Response, NextFunction } from "express";
import { ErrorMessages } from "../utils/errorMessages";
import { MessageFactory } from "../utils/messageFactory";
import { Request as RequestModel, User, RequestVote } from "../db";
import { Op } from "sequelize";

const factory = new MessageFactory();

/**
 * Valida i campi `brano` e `artista` presenti nella richiesta.
 *
 * - Entrambi devono essere stringhe non vuote di almeno 2 caratteri.
 * - Se non validi, restituisce un errore 400.
 *
 * @param req - Richiesta HTTP contenente brano e artista nel body
 * @param res - Risposta HTTP con eventuale errore
 * @param next - Funzione per passare al middleware successivo
 */
export function validateRequestCreation(req: Request, res: Response, next: NextFunction) {
  const { brano, artista } = req.body;

  if (!brano || typeof brano !== "string" || brano.trim().length < 2) {
    return factory.getStatusMessage(res, ErrorMessages.INVALID_TRACK_NAME.status, ErrorMessages.INVALID_TRACK_NAME.message);
  }

  if (!artista || typeof artista !== "string" || artista.trim().length < 2) {
    return factory.getStatusMessage(res, ErrorMessages.INVALID_ARTIST_NAME.status, ErrorMessages.INVALID_ARTIST_NAME.message);
  }

  next();
}

/**
 * Verifica se esiste già una richiesta con stesso `brano` e `artista`
 * in stato "waiting" o "satisfied".
 *
 * - Se trovata, restituisce errore specifico.
 *
 * @param req - Richiesta HTTP contenente brano e artista
 * @param res - Risposta HTTP con errore se duplicata
 * @param next - Funzione per passare al middleware successivo
 */
export async function checkDuplicateRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { brano, artista } = req.body;

    const normalizedBrano = brano.trim().toLowerCase();
    const normalizedArtista = artista.trim().toLowerCase();

    const existing = await RequestModel.findOne({
      where: {
        [Op.or]: [
          {
            brano: { [Op.iLike]: normalizedBrano },
            artista: { [Op.iLike]: normalizedArtista },
            status: "waiting"
          },
          {
            brano: { [Op.iLike]: normalizedBrano },
            artista: { [Op.iLike]: normalizedArtista },
            status: "satisfied"
          }
        ]
      }
    });

    if (existing) {
      if (existing.status === "waiting") {
        return factory.getStatusMessage(res, ErrorMessages.DUPLICATE_REQUEST.status, ErrorMessages.DUPLICATE_REQUEST.message);
      } else if (existing.status === "satisfied") {
        return factory.getStatusMessage(res, ErrorMessages.ALREADY_ADDED.status, ErrorMessages.ALREADY_ADDED.message);
      }
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Verifica se l’utente ha almeno 3 token per poter creare una richiesta.
 *
 * - In caso contrario, restituisce errore.
 * - Se valido, salva l'oggetto utente in `res.locals.user`.
 *
 * @param req - Richiesta HTTP con JWT contenente ID utente
 * @param res - Risposta HTTP con errore o proseguimento
 * @param next - Funzione per passare al middleware successivo
 */
export async function checkUserHasTokens(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    const user = await User.findByPk(userId);

    if (!user || user.tokens < 3) {
      return factory.getStatusMessage(res, ErrorMessages.UNSUFFICIENT_TOKENS.status, ErrorMessages.UNSUFFICIENT_TOKENS.message);
    }

    res.locals.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Verifica che esista una richiesta con l’ID specificato nei parametri.
 *
 * - Se non trovata, restituisce errore 404.
 *
 * @param req - Richiesta HTTP con `id` nei parametri
 * @param res - Risposta HTTP con errore o proseguimento
 * @param next - Funzione per passare al middleware successivo
 */
export async function checkRequestExists(req: Request, res: Response, next: NextFunction) {
  try {
    const requestId = Number(req.params.id);
    const request = await RequestModel.findByPk(requestId);

    if (!request) {
      return factory.getStatusMessage(res, 404, "Richiesta non trovata");
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Verifica se l’utente ha già votato per la richiesta specificata.
 *
 * - Se ha già votato, restituisce errore.
 *
 * @param req - Richiesta HTTP con `id` nei parametri
 * @param res - Risposta HTTP con errore o proseguimento
 * @param next - Funzione per passare al middleware successivo
 */
export async function checkAlreadyVoted(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    const requestId = Number(req.params.id);

    const exists = await RequestVote.findOne({ where: { user_id: userId, request_id: requestId } });
    if (exists) {
      return factory.getStatusMessage(res, ErrorMessages.ALREADY_VOTED.status, ErrorMessages.ALREADY_VOTED.message);
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Verifica se l’utente ha votato una richiesta, per poter rimuovere il voto.
 *
 * - Se non ha votato, restituisce errore.
 *
 * @param req - Richiesta HTTP con `id` nei parametri
 * @param res - Risposta HTTP con errore o proseguimento
 * @param next - Funzione per passare al middleware successivo
 */
export async function checkHasVoted(req: Request, res: Response, next: NextFunction) {
    try {
    const userId = (req as any).user?.id;
    const requestId = Number(req.params.id);

    const exists = await RequestVote.findOne({ where: { user_id: userId, request_id: requestId } });
    if (!exists) {
      return factory.getStatusMessage(res, ErrorMessages.NOT_VOTED.status, ErrorMessages.NOT_VOTED.message);
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Verifica che la richiesta esista e sia ancora in stato "waiting".
 *
 * - Se valida, salva la richiesta in `res.locals.request`.
 *
 * @param req - Richiesta HTTP con `id` nei parametri
 * @param res - Risposta HTTP con errore o proseguimento
 * @param next - Funzione per passare al middleware successivo
 */
export async function checkRequestWaiting(req: Request, res: Response, next: NextFunction) {
  try {
    const requestId = Number(req.params.id);
    const request = await RequestModel.findByPk(requestId);

    if (!request) {
      return factory.getStatusMessage(res, ErrorMessages.REQUEST_NOT_FOUND.status, ErrorMessages.REQUEST_NOT_FOUND.message);
    }

    if (request.status !== "waiting") {
      return factory.getStatusMessage(res, ErrorMessages.REQUEST_NOT_EDITABLE.status, ErrorMessages.REQUEST_NOT_EDITABLE.message);
    }

    res.locals.request = request;
    next();
  } catch (err) {
    next(err);
  }
}
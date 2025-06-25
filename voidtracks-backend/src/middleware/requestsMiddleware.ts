import { Request, Response, NextFunction } from "express";
import { ErrorMessages } from "../utils/errorMessages";
import { MessageFactory } from "../utils/messageFactory";
import { Request as RequestModel, User, RequestVote } from "../db";
import { Op } from "sequelize";

const factory = new MessageFactory();

/**
 * Valida i campi brano e artista
 */
export const validateRequestCreation = (req: Request, res: Response, next: NextFunction) => {
  const { brano, artista } = req.body;

  if (!brano || typeof brano !== "string" || brano.trim().length < 2) {
    return factory.getStatusMessage(res, ErrorMessages.INVALID_TRACK_NAME.status, ErrorMessages.INVALID_TRACK_NAME.message);
  }

  if (!artista || typeof artista !== "string" || artista.trim().length < 2) {
    return factory.getStatusMessage(res, ErrorMessages.INVALID_ARTIST_NAME.status, ErrorMessages.INVALID_ARTIST_NAME.message);
  }

  next();
};

/**
 * Verifica se esiste già una richiesta identica in attesa
 */
export const checkDuplicateRequest = async (req: Request, res: Response, next: NextFunction) => {
  const { brano, artista } = req.body;

  const existing = await RequestModel.findOne({
    where: {
      brano: { [Op.iLike]: brano },
      artista: { [Op.iLike]: artista },
      status: "waiting"
    }
  });

  if (existing) {
    return factory.getStatusMessage(res, ErrorMessages.DUPLICATE_REQUEST.status, ErrorMessages.DUPLICATE_REQUEST.message);
  }

  next();
};

/**
 * Verifica se l’utente ha abbastanza token per creare la richiesta
 */
export const checkUserHasTokens = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  const user = await User.findByPk(userId);

  if (!user || user.tokens < 3) {
    return factory.getStatusMessage(res, ErrorMessages.UNSUFFICIENT_TOKENS.status, ErrorMessages.UNSUFFICIENT_TOKENS.message);
  }

  res.locals.user = user; // memorizziamo l'oggetto user per il controller
  next();
};

export const checkRequestExists = async (req: Request, res: Response, next: NextFunction) => {
  const requestId = Number(req.params.id);
  const request = await RequestModel.findByPk(requestId);
  if (!request) {
    return factory.getStatusMessage(res, 404, "Richiesta non trovata");
  }
  next();
};

/**
 * Verifica se l’utente ha già votato per una richiesta
 */
export const checkAlreadyVoted = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  const requestId = Number(req.params.id);

  const exists = await RequestVote.findOne({ where: { user_id: userId, request_id: requestId } });
  if (exists) {
    return factory.getStatusMessage(res, ErrorMessages.ALREADY_VOTED.status, ErrorMessages.ALREADY_VOTED.message);
  }

  next();
};

/**
 * Verifica se l’utente ha effettivamente votato (per poterlo rimuovere)
 */
export const checkHasVoted = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  const requestId = Number(req.params.id);

  const exists = await RequestVote.findOne({ where: { user_id: userId, request_id: requestId } });
  if (!exists) {
    return factory.getStatusMessage(res, ErrorMessages.NOT_VOTED.status, ErrorMessages.NOT_VOTED.message);
  }

  next();
};

/**
 * Verifica che la richiesta esista ed abbia status "waiting"
 */
export const checkRequestWaiting = async (req: Request, res: Response, next: NextFunction) => {
  const requestId = Number(req.params.id);
  const request = await RequestModel.findByPk(requestId);

  if (!request) {
    return factory.getStatusMessage(res, 404, "Richiesta non trovata");
  }

  if (request.status !== "waiting") {
    return factory.getStatusMessage(res, 400, "La richiesta non è più modificabile");
  }

  // la salviamo per uso successivo nel controller
  res.locals.request = request;
  next();
};
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRequestWaiting = exports.checkHasVoted = exports.checkAlreadyVoted = exports.checkRequestExists = exports.checkUserHasTokens = exports.checkDuplicateRequest = exports.validateRequestCreation = void 0;
const errorMessages_1 = require("../utils/errorMessages");
const messageFactory_1 = require("../utils/messageFactory");
const db_1 = require("../db");
const sequelize_1 = require("sequelize");
const factory = new messageFactory_1.MessageFactory();
/**
 * Valida i campi brano e artista
 */
const validateRequestCreation = (req, res, next) => {
    const { brano, artista } = req.body;
    if (!brano || typeof brano !== "string" || brano.trim().length < 2) {
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INVALID_TRACK_NAME.status, errorMessages_1.ErrorMessages.INVALID_TRACK_NAME.message);
    }
    if (!artista || typeof artista !== "string" || artista.trim().length < 2) {
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INVALID_ARTIST_NAME.status, errorMessages_1.ErrorMessages.INVALID_ARTIST_NAME.message);
    }
    next();
};
exports.validateRequestCreation = validateRequestCreation;
/**
 * Verifica se esiste già una richiesta identica in attesa
 */
const checkDuplicateRequest = async (req, res, next) => {
    const { brano, artista } = req.body;
    const existing = await db_1.Request.findOne({
        where: {
            brano: { [sequelize_1.Op.iLike]: brano },
            artista: { [sequelize_1.Op.iLike]: artista },
            status: "waiting"
        }
    });
    if (existing) {
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.DUPLICATE_REQUEST.status, errorMessages_1.ErrorMessages.DUPLICATE_REQUEST.message);
    }
    next();
};
exports.checkDuplicateRequest = checkDuplicateRequest;
/**
 * Verifica se l’utente ha abbastanza token per creare la richiesta
 */
const checkUserHasTokens = async (req, res, next) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const user = await db_1.User.findByPk(userId);
    if (!user || user.tokens < 3) {
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.UNSUFFICIENT_TOKENS.status, errorMessages_1.ErrorMessages.UNSUFFICIENT_TOKENS.message);
    }
    res.locals.user = user; // memorizziamo l'oggetto user per il controller
    next();
};
exports.checkUserHasTokens = checkUserHasTokens;
const checkRequestExists = async (req, res, next) => {
    const requestId = Number(req.params.id);
    const request = await db_1.Request.findByPk(requestId);
    if (!request) {
        return factory.getStatusMessage(res, 404, "Richiesta non trovata");
    }
    next();
};
exports.checkRequestExists = checkRequestExists;
/**
 * Verifica se l’utente ha già votato per una richiesta
 */
const checkAlreadyVoted = async (req, res, next) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const requestId = Number(req.params.id);
    const exists = await db_1.RequestVote.findOne({ where: { user_id: userId, request_id: requestId } });
    if (exists) {
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.ALREADY_VOTED.status, errorMessages_1.ErrorMessages.ALREADY_VOTED.message);
    }
    next();
};
exports.checkAlreadyVoted = checkAlreadyVoted;
/**
 * Verifica se l’utente ha effettivamente votato (per poterlo rimuovere)
 */
const checkHasVoted = async (req, res, next) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const requestId = Number(req.params.id);
    const exists = await db_1.RequestVote.findOne({ where: { user_id: userId, request_id: requestId } });
    if (!exists) {
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.NOT_VOTED.status, errorMessages_1.ErrorMessages.NOT_VOTED.message);
    }
    next();
};
exports.checkHasVoted = checkHasVoted;
/**
 * Verifica che la richiesta esista ed abbia status "waiting"
 */
const checkRequestWaiting = async (req, res, next) => {
    const requestId = Number(req.params.id);
    const request = await db_1.Request.findByPk(requestId);
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
exports.checkRequestWaiting = checkRequestWaiting;

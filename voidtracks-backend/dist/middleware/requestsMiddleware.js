"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequestCreation = validateRequestCreation;
exports.checkDuplicateRequest = checkDuplicateRequest;
exports.checkUserHasTokens = checkUserHasTokens;
exports.checkRequestExists = checkRequestExists;
exports.checkAlreadyVoted = checkAlreadyVoted;
exports.checkHasVoted = checkHasVoted;
exports.checkRequestWaiting = checkRequestWaiting;
const errorMessages_1 = require("../utils/errorMessages");
const messageFactory_1 = require("../utils/messageFactory");
const db_1 = require("../db");
const sequelize_1 = require("sequelize");
const factory = new messageFactory_1.MessageFactory();
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
function validateRequestCreation(req, res, next) {
    const { brano, artista } = req.body;
    if (!brano || typeof brano !== "string" || brano.trim().length < 2) {
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INVALID_TRACK_NAME.status, errorMessages_1.ErrorMessages.INVALID_TRACK_NAME.message);
    }
    if (!artista || typeof artista !== "string" || artista.trim().length < 2) {
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INVALID_ARTIST_NAME.status, errorMessages_1.ErrorMessages.INVALID_ARTIST_NAME.message);
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
async function checkDuplicateRequest(req, res, next) {
    try {
        const { brano, artista } = req.body;
        const normalizedBrano = brano.trim().toLowerCase();
        const normalizedArtista = artista.trim().toLowerCase();
        const existing = await db_1.Request.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    {
                        brano: { [sequelize_1.Op.iLike]: normalizedBrano },
                        artista: { [sequelize_1.Op.iLike]: normalizedArtista },
                        status: "waiting"
                    },
                    {
                        brano: { [sequelize_1.Op.iLike]: normalizedBrano },
                        artista: { [sequelize_1.Op.iLike]: normalizedArtista },
                        status: "satisfied"
                    }
                ]
            }
        });
        if (existing) {
            if (existing.status === "waiting") {
                return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.DUPLICATE_REQUEST.status, errorMessages_1.ErrorMessages.DUPLICATE_REQUEST.message);
            }
            else if (existing.status === "satisfied") {
                return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.ALREADY_ADDED.status, errorMessages_1.ErrorMessages.ALREADY_ADDED.message);
            }
        }
        next();
    }
    catch (err) {
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
async function checkUserHasTokens(req, res, next) {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const user = await db_1.User.findByPk(userId);
        if (!user || user.tokens < 3) {
            return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.UNSUFFICIENT_TOKENS.status, errorMessages_1.ErrorMessages.UNSUFFICIENT_TOKENS.message);
        }
        res.locals.user = user;
        next();
    }
    catch (err) {
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
async function checkRequestExists(req, res, next) {
    try {
        const requestId = Number(req.params.id);
        const request = await db_1.Request.findByPk(requestId);
        if (!request) {
            return factory.getStatusMessage(res, 404, "Richiesta non trovata");
        }
        next();
    }
    catch (err) {
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
async function checkAlreadyVoted(req, res, next) {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const requestId = Number(req.params.id);
        const exists = await db_1.RequestVote.findOne({ where: { user_id: userId, request_id: requestId } });
        if (exists) {
            return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.ALREADY_VOTED.status, errorMessages_1.ErrorMessages.ALREADY_VOTED.message);
        }
        next();
    }
    catch (err) {
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
async function checkHasVoted(req, res, next) {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const requestId = Number(req.params.id);
        const exists = await db_1.RequestVote.findOne({ where: { user_id: userId, request_id: requestId } });
        if (!exists) {
            return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.NOT_VOTED.status, errorMessages_1.ErrorMessages.NOT_VOTED.message);
        }
        next();
    }
    catch (err) {
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
async function checkRequestWaiting(req, res, next) {
    try {
        const requestId = Number(req.params.id);
        const request = await db_1.Request.findByPk(requestId);
        if (!request) {
            return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.REQUEST_NOT_FOUND.status, errorMessages_1.ErrorMessages.REQUEST_NOT_FOUND.message);
        }
        if (request.status !== "waiting") {
            return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.REQUEST_NOT_EDITABLE.status, errorMessages_1.ErrorMessages.REQUEST_NOT_EDITABLE.message);
        }
        res.locals.request = request;
        next();
    }
    catch (err) {
        next(err);
    }
}

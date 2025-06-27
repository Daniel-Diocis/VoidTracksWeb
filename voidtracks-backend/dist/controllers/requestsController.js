"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRequests = getAllRequests;
exports.createRequest = createRequest;
exports.voteRequest = voteRequest;
exports.unvoteRequest = unvoteRequest;
const db_1 = require("../db");
const errorMessages_1 = require("../utils/errorMessages");
const messageFactory_1 = require("../utils/messageFactory");
const User_1 = __importDefault(require("../models/User"));
const factory = new messageFactory_1.MessageFactory();
/**
 * Restituisce tutte le richieste in stato "waiting", con numero voti e flag `hasVoted`.
 *
 * - Ordina i risultati per numero di voti decrescente.
 * - Include un flag `hasVoted` se l’utente loggato ha già votato quella richiesta.
 *
 * @param req - Oggetto della richiesta HTTP con `user.id`.
 * @param res - Risposta JSON con lista delle richieste e relativi voti.
 */
async function getAllRequests(req, res, next) {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const requests = await db_1.Request.findAll({
            where: { status: "waiting" },
            include: [{ model: db_1.RequestVote, as: "votes" }],
        });
        const userVotes = await db_1.RequestVote.findAll({
            where: { user_id: userId },
            attributes: ["request_id"],
        });
        const votedRequestIds = new Set(userVotes.map((v) => v.request_id));
        const data = requests
            .map((r) => {
            var _a;
            return ({
                id: r.id,
                brano: r.brano,
                artista: r.artista,
                status: r.status,
                tokens: r.tokens,
                createdAt: r.createdAt,
                updatedAt: r.updatedAt,
                voti: ((_a = r.votes) === null || _a === void 0 ? void 0 : _a.length) || 0,
                hasVoted: votedRequestIds.has(r.id),
            });
        })
            .sort((a, b) => b.voti - a.voti);
        res.json(data);
    }
    catch (error) {
        next(error);
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
async function createRequest(req, res, next) {
    try {
        const { brano, artista } = req.body;
        const userToken = req.user;
        const dbUser = await User_1.default.findByPk(userToken.id);
        if (!dbUser) {
            return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.USER_NOT_FOUND.status, "Utente non trovato");
        }
        const newRequest = await db_1.Request.create({
            brano,
            artista,
            user_id: dbUser.id,
        });
        dbUser.tokens -= 3;
        await dbUser.save();
        res.status(201).json(newRequest);
    }
    catch (error) {
        next(error);
    }
}
/**
 * Aggiunge un voto a una richiesta specifica da parte dell’utente autenticato.
 *
 * @param req - Oggetto della richiesta HTTP con `user.id` e `req.params.id`.
 * @param res - Risposta JSON con messaggio di conferma.
 */
async function voteRequest(req, res, next) {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const requestId = Number(req.params.id);
        await db_1.RequestVote.create({ user_id: userId, request_id: requestId });
        res.status(201).json({ message: "Voto aggiunto" });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Rimuove il voto dell’utente autenticato da una richiesta specifica.
 *
 * @param req - Oggetto della richiesta HTTP con `user.id` e `req.params.id`.
 * @param res - Risposta JSON con messaggio di conferma.
 */
async function unvoteRequest(req, res, next) {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const requestId = Number(req.params.id);
        await db_1.RequestVote.destroy({
            where: { user_id: userId, request_id: requestId },
        });
        res.json({ message: "Voto rimosso" });
    }
    catch (error) {
        next(error);
    }
}

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
 * Restituisce tutte le richieste con i voti associati, ordinate per numero di voti.
 */
async function getAllRequests(req, res) {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Ottieni tutte le richieste in stato 'waiting' con i voti
        const requests = await db_1.Request.findAll({
            where: { status: "waiting" },
            include: [{ model: db_1.RequestVote, as: "votes" }],
        });
        // Recupera gli ID delle richieste votate dall’utente loggato
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
                hasVoted: votedRequestIds.has(r.id), // 👈 Aggiunto campo
            });
        })
            .sort((a, b) => b.voti - a.voti);
        res.json(data);
    }
    catch (error) {
        console.error("Errore nel recupero richieste:", error);
        factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INTERNAL_ERROR.status, errorMessages_1.ErrorMessages.INTERNAL_ERROR.message);
    }
}
/**
 * Crea una nuova richiesta e scala i token all'utente.
 */
async function createRequest(req, res) {
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
        console.error("Errore nella creazione richiesta:", error);
        factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INTERNAL_ERROR.status, errorMessages_1.ErrorMessages.INTERNAL_ERROR.message);
    }
}
/**
 * Aggiunge un voto a una richiesta da parte di un utente.
 */
async function voteRequest(req, res) {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const requestId = Number(req.params.id);
        await db_1.RequestVote.create({ user_id: userId, request_id: requestId });
        res.status(201).json({ message: "Voto aggiunto" });
    }
    catch (error) {
        console.error("Errore durante l'aggiunta del voto:", error);
        factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INTERNAL_ERROR.status, errorMessages_1.ErrorMessages.INTERNAL_ERROR.message);
    }
}
/**
 * Rimuove un voto da una richiesta da parte di un utente.
 */
async function unvoteRequest(req, res) {
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
        console.error("Errore durante la rimozione del voto:", error);
        factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INTERNAL_ERROR.status, errorMessages_1.ErrorMessages.INTERNAL_ERROR.message);
    }
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectRequest = void 0;
exports.rechargeTokens = rechargeTokens;
exports.getPendingRequests = getPendingRequests;
exports.approveRequest = approveRequest;
const errorMessages_1 = require("../utils/errorMessages");
const messageFactory_1 = require("../utils/messageFactory");
const User_1 = __importDefault(require("../models/User"));
const Request_1 = __importDefault(require("../models/Request"));
const RequestVote_1 = __importDefault(require("../models/RequestVote"));
const Notification_1 = __importDefault(require("../models/Notification"));
const factory = new messageFactory_1.MessageFactory();
/**
 * Ricarica il numero di token di un utente specificato tramite username.
 *
 * - Il middleware precedente valida `username` e `tokens`.
 * - Se l’utente esiste, aggiorna il saldo token.
 *
 * @param req - Richiesta HTTP con `username` e `tokens` nel body.
 * @param res - Risposta JSON con conferma e nuovo saldo token, oppure errore.
 */
async function rechargeTokens(req, res, next) {
    const { username, tokens } = req.body;
    try {
        const user = await User_1.default.findOne({ where: { username } });
        if (!user) {
            return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.USER_NOT_FOUND.status, errorMessages_1.ErrorMessages.USER_NOT_FOUND.message);
        }
        user.tokens = tokens;
        await user.save();
        res.json({
            message: `Ricarica completata per ${user.username}`,
            tokens: user.tokens,
        });
    }
    catch (error) {
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
async function getPendingRequests(req, res, next) {
    try {
        const requests = await Request_1.default.findAll({
            where: { status: "waiting" },
            include: [
                {
                    model: User_1.default,
                    attributes: ["username"]
                },
                {
                    model: RequestVote_1.default,
                    attributes: ["user_id"],
                    as: "votes"
                }
            ],
            order: [["created_at", "DESC"]]
        });
        const formatted = requests.map(r => {
            var _a, _b;
            return ({
                id: r.id,
                brano: r.brano,
                artista: r.artista,
                tokens: r.tokens,
                createdAt: r.createdAt,
                updatedAt: r.updatedAt,
                user: ((_a = r.User) === null || _a === void 0 ? void 0 : _a.username) || "utente sconosciuto",
                voti: ((_b = r.votes) === null || _b === void 0 ? void 0 : _b.length) || 0
            });
        });
        return res.json(formatted);
    }
    catch (error) {
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
async function approveRequest(req, res, next) {
    const request = res.locals.request;
    const { tokensToAdd } = req.body;
    try {
        await request.update({ status: "satisfied", tokens: tokensToAdd });
        const creator = await User_1.default.findByPk(request.user_id);
        if (creator) {
            creator.tokens += tokensToAdd;
            await creator.save();
            await Notification_1.default.create({
                user_id: creator.id,
                message: `La tua richiesta per "${request.brano}" di ${request.artista} è stata approvata. +${tokensToAdd} token accreditati!`,
                seen: false
            });
        }
        const votes = await RequestVote_1.default.findAll({ where: { request_id: request.id } });
        const voterIds = votes.map(v => v.user_id).filter(id => id !== request.user_id);
        const notifications = voterIds.map(user_id => ({
            user_id,
            message: `La richiesta per "${request.brano}" di ${request.artista} che hai votato è stata approvata!`,
            seen: false
        }));
        await Notification_1.default.bulkCreate(notifications);
        return res.json({ message: "Richiesta approvata, token accreditati, notifiche inviate" });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Rifiuta una richiesta impostandone lo stato su "rejected".
 *
 * @param _req - Richiesta HTTP (non usata).
 * @param res - Risposta JSON con messaggio di conferma o errore.
 */
const rejectRequest = async (_req, res, next) => {
    const request = res.locals.request;
    try {
        await request.update({ status: "rejected" });
        return res.json({ message: "Richiesta rifiutata con successo" });
    }
    catch (error) {
        next(error);
    }
};
exports.rejectRequest = rejectRequest;

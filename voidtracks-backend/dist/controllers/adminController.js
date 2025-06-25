"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectRequest = exports.approveRequest = void 0;
exports.rechargeTokens = rechargeTokens;
exports.getPendingRequests = getPendingRequests;
const errorMessages_1 = require("../utils/errorMessages");
const messageFactory_1 = require("../utils/messageFactory");
const User_1 = __importDefault(require("../models/User"));
const Request_1 = __importDefault(require("../models/Request"));
const RequestVote_1 = __importDefault(require("../models/RequestVote"));
const factory = new messageFactory_1.MessageFactory();
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
async function rechargeTokens(req, res) {
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
    catch (err) {
        console.error("Errore ricarica token:", err);
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INTERNAL_ERROR.status, errorMessages_1.ErrorMessages.INTERNAL_ERROR.message);
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
async function getPendingRequests(req, res) {
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
                    as: "votes" // <-- usa lo stesso alias definito in `Request.hasMany(...)`
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
    catch (err) {
        console.error("Errore fetch richieste pendenti:", err);
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INTERNAL_ERROR.status, errorMessages_1.ErrorMessages.INTERNAL_ERROR.message);
    }
}
/**
 * Approva una richiesta impostandone lo stato su "satisfied".
 */
const approveRequest = async (_req, res) => {
    const request = res.locals.request;
    try {
        await request.update({ status: "satisfied" });
        return res.json({ message: "Richiesta approvata con successo" });
    }
    catch (err) {
        console.error("Errore approvazione richiesta:", err);
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INTERNAL_ERROR.status, errorMessages_1.ErrorMessages.INTERNAL_ERROR.message);
    }
};
exports.approveRequest = approveRequest;
/**
 * Rifiuta una richiesta impostandone lo stato su "rejected".
 */
const rejectRequest = async (_req, res) => {
    const request = res.locals.request;
    try {
        await request.update({ status: "rejected" });
        return res.json({ message: "Richiesta rifiutata con successo" });
    }
    catch (err) {
        console.error("Errore rifiuto richiesta:", err);
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INTERNAL_ERROR.status, errorMessages_1.ErrorMessages.INTERNAL_ERROR.message);
    }
};
exports.rejectRequest = rejectRequest;

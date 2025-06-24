"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rechargeTokens = rechargeTokens;
const errorMessages_1 = require("../utils/errorMessages");
const messageFactory_1 = require("../utils/messageFactory");
const User_1 = __importDefault(require("../models/User"));
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

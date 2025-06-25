"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRechargeInput = validateRechargeInput;
exports.validateTokenAmount = validateTokenAmount;
const errorMessages_1 = require("../utils/errorMessages");
const messageFactory_1 = require("../utils/messageFactory");
const factory = new messageFactory_1.MessageFactory();
/**
 * Middleware di validazione per la ricarica dei token da parte dell’admin.
 *
 * - Verifica che `username` sia una stringa non vuota.
 * - Verifica che `tokens` sia un numero maggiore o uguale a zero.
 * - In caso di input non valido, restituisce un errore 400 con messaggio standardizzato.
 *
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
function validateRechargeInput(req, res, next) {
    const { username, tokens } = req.body;
    if (!username ||
        typeof username !== "string" ||
        typeof tokens !== "number" ||
        tokens < 0) {
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INVALID_RECHARGE_INPUT.status, errorMessages_1.ErrorMessages.INVALID_RECHARGE_INPUT.message);
    }
    next();
}
function validateTokenAmount(req, res, next) {
    const { tokensToAdd } = req.body;
    if (typeof tokensToAdd !== "number" || tokensToAdd < 0) {
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INVALID_INPUT.status, errorMessages_1.ErrorMessages.INVALID_INPUT.message);
    }
    next();
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const errorMessages_1 = require("../utils/errorMessages");
const messageFactory_1 = require("../utils/messageFactory");
const factory = new messageFactory_1.MessageFactory();
/**
 * Middleware globale per la gestione degli errori.
 *
 * - Cattura tutti gli errori non gestiti e restituisce un messaggio generico.
 * - Se presente, usa `err.status` per impostare il codice HTTP.
 *
 * @param err - Oggetto errore catturato.
 * @param _req - Oggetto della richiesta (non utilizzato).
 * @param res - Oggetto della risposta HTTP.
 * @param _next - Funzione next (non utilizzata).
 * @returns Risposta HTTP con messaggio d’errore.
 */
function errorHandler(err, _req, res, _next) {
    console.error(err.stack);
    const statusCode = err.status || errorMessages_1.ErrorMessages.INTERNAL_ERROR.status;
    const message = err.message || errorMessages_1.ErrorMessages.INTERNAL_ERROR.message;
    return factory.getStatusMessage(res, statusCode, message);
}

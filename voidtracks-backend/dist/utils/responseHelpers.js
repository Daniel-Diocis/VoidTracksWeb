"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = sendError;
const http_status_codes_1 = require("http-status-codes");
/**
 * Invia una risposta di errore HTTP standardizzata.
 *
 * @param res - Oggetto Response di Express
 * @param statusCode - Codice di stato HTTP (es. StatusCodes.BAD_REQUEST)
 * @param message - Messaggio personalizzato aggiuntivo opzionale
 */
function sendError(res, statusCode, message) {
    const statusKey = Object.keys(http_status_codes_1.StatusCodes).find((key) => http_status_codes_1.StatusCodes[key] === statusCode);
    const reasonPhrase = http_status_codes_1.ReasonPhrases[statusKey] || "Errore";
    const errorMessage = message ? `${reasonPhrase}: ${message}` : reasonPhrase;
    return res.status(statusCode).json({ error: errorMessage });
}

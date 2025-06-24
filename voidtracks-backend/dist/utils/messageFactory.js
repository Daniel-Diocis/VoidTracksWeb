"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageFactory = void 0;
const http_status_codes_1 = require("http-status-codes");
/**
 * Factory per la generazione centralizzata di messaggi di errore HTTP.
 *
 * Fornisce un metodo per restituire risposte JSON con codici di stato coerenti
 * e messaggi descrittivi, combinando le costanti `StatusCodes` e `ReasonPhrases`.
 */
class MessageFactory {
    /**
     * Restituisce una risposta JSON con il codice di stato e un messaggio formattato.
     *
     * - Se fornito, `message` viene concatenato alla frase standard HTTP per maggiore chiarezza.
     * - In caso contrario, viene utilizzata solo la frase standard (es. "Bad Request").
     *
     * @param res - Oggetto `Response` di Express.
     * @param statusCode - Codice di stato HTTP da restituire.
     * @param message - Messaggio opzionale da includere nella risposta.
     * @returns L'oggetto `Response` con status e JSON del messaggio.
     */
    getStatusMessage(res, statusCode, message) {
        const statusKey = Object.keys(http_status_codes_1.StatusCodes).find(key => http_status_codes_1.StatusCodes[key] === statusCode);
        const reasonPhrase = http_status_codes_1.ReasonPhrases[statusKey] || "Errore";
        const errorMessage = message ? `${reasonPhrase}: ${message}` : reasonPhrase;
        return res.status(statusCode).json({ error: errorMessage });
    }
}
exports.MessageFactory = MessageFactory;

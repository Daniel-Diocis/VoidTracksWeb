"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTrackQuery = validateTrackQuery;
exports.logTrackRequest = logTrackRequest;
const http_status_codes_1 = require("http-status-codes");
const messageFactory_1 = require("../utils/messageFactory");
const factory = new messageFactory_1.MessageFactory();
/**
 * Middleware di validazione per il parametro `q` della query string.
 *
 * - Verifica che, se presente, `q` sia una stringa.
 * - In caso contrario, restituisce un errore HTTP 400.
 *
 * @param req - Oggetto della richiesta HTTP contenente `req.query.q`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
function validateTrackQuery(req, res, next) {
    const q = req.query.q;
    if (q && typeof q !== "string") {
        return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.BAD_REQUEST, "Il parametro 'q' deve essere una stringa");
    }
    next();
}
/**
 * Middleware di logging per le ricerche di brani.
 *
 * - Se è presente una query `q`, stampa in console il valore cercato.
 * - Utile per monitorare le richieste effettuate al controller dei brani.
 *
 * @param req - Oggetto della richiesta HTTP.
 * @param _res - Oggetto della risposta HTTP (non utilizzato).
 * @param next - Funzione per passare al middleware successivo.
 */
function logTrackRequest(req, _res, next) {
    if (req.query.q) {
        console.log(`[Tracks] Ricerca per query: "${req.query.q}"`);
    }
    next();
}

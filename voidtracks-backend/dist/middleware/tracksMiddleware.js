"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTrackQuery = validateTrackQuery;
exports.logTrackRequest = logTrackRequest;
const errorMessages_1 = require("../utils/errorMessages");
const messageFactory_1 = require("../utils/messageFactory");
const factory = new messageFactory_1.MessageFactory();
/**
 * Valida il parametro di query `q` per la ricerca dei brani.
 *
 * Se presente, verifica che sia una stringa.
 *
 * @param req - Oggetto della richiesta HTTP contenente `req.query.q`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Risposta 400 se `q` non è una stringa.
 */
function validateTrackQuery(req, res, next) {
    const q = req.query.q;
    if (q && typeof q !== "string") {
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.Q_NOT_STRING.status, errorMessages_1.ErrorMessages.Q_NOT_STRING.message);
    }
    next();
}
/**
 * Registra nel log la query di ricerca dei brani, se presente.
 *
 * Utile per il tracciamento e debug delle richieste al servizio tracce.
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

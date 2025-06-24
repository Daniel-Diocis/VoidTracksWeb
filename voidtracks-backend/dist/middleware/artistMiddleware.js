"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateArtistName = validateArtistName;
const http_status_codes_1 = require("http-status-codes");
const messageFactory_1 = require("../utils/messageFactory");
const factory = new messageFactory_1.MessageFactory();
/**
 * Middleware di validazione del parametro `nome` per la ricerca artista.
 *
 * - Controlla che `nome` sia una stringa non vuota e non composta solo da spazi.
 * - In caso di valore non valido, restituisce un errore 400 con messaggio coerente.
 *
 * @param req - Oggetto della richiesta HTTP contenente `req.params.nome`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
function validateArtistName(req, res, next) {
    const { nome } = req.params;
    if (!nome || typeof nome !== "string" || nome.trim().length === 0) {
        return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.BAD_REQUEST, "Nome artista non valido");
    }
    next();
}

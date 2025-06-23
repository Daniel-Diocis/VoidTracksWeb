"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageFactory = void 0;
const http_status_codes_1 = require("http-status-codes");
class MessageFactory {
    getStatusMessage(res, statusCode, message) {
        const statusKey = Object.keys(http_status_codes_1.StatusCodes).find(key => http_status_codes_1.StatusCodes[key] === statusCode);
        const reasonPhrase = http_status_codes_1.ReasonPhrases[statusKey] || "Errore";
        const errorMessage = message ? `${reasonPhrase}: ${message}` : reasonPhrase;
        return res.status(statusCode).json({ error: errorMessage });
    }
}
exports.MessageFactory = MessageFactory;

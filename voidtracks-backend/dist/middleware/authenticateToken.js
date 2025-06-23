"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
const http_status_codes_1 = require("http-status-codes");
const messageFactory_1 = require("../utils/messageFactory");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Legge la chiave pubblica da file
const publicKeyPath = process.env.PUBLIC_KEY_PATH || "public.key";
const publicKey = fs_1.default.readFileSync(path_1.default.resolve(publicKeyPath), "utf8");
const factory = new messageFactory_1.MessageFactory();
/**
 * Middleware di autenticazione basato su JWT.
 *
 * - Verifica la presenza e la validità del token nell'header Authorization.
 * - Se il token è valido, aggiunge il payload decodificato all’oggetto `req`.
 *
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Risposta 401 se il token è mancante o non valido.
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, "Token mancante");
    }
    jsonwebtoken_1.default.verify(token, publicKey, { algorithms: ["RS256"] }, (err, payload) => {
        if (err) {
            return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, "Token non valido o scaduto");
        }
        req.user = payload;
        next();
    });
}

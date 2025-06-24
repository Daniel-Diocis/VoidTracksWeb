"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
const errorMessages_1 = require("../utils/errorMessages");
const messageFactory_1 = require("../utils/messageFactory");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Legge la chiave pubblica da file
const publicKeyPath = process.env.PUBLIC_KEY_PATH || "public.key";
const publicKey = fs_1.default.readFileSync(path_1.default.resolve(publicKeyPath), "utf8");
const factory = new messageFactory_1.MessageFactory();
/**
 * Middleware di autenticazione JWT.
 *
 * Questo middleware verifica la presenza e la validità del token JWT fornito
 * nell'header `Authorization` delle richieste HTTP.
 *
 * Se il token è valido:
 * - Decodifica il payload e lo assegna a `req.user`.
 * - Prosegue al middleware successivo.
 *
 * In caso di token mancante o non valido:
 * - Risponde con codice 401 Unauthorized e un messaggio descrittivo.
 *
 * @param req - Oggetto della richiesta HTTP (Express).
 * @param res - Oggetto della risposta HTTP (Express).
 * @param next - Funzione che richiama il middleware successivo.
 * @returns Risposta HTTP 401 in caso di assenza o invalidità del token.
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.MISSING_TOKEN.status, errorMessages_1.ErrorMessages.MISSING_TOKEN.message);
    }
    jsonwebtoken_1.default.verify(token, publicKey, { algorithms: ["RS256"] }, (err, payload) => {
        if (err) {
            return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INVALID_TOKEN.status, errorMessages_1.ErrorMessages.INVALID_TOKEN.message);
        }
        req.user = payload;
        next();
    });
}

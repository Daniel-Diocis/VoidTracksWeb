"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = authenticateUser;
exports.authenticateAdmin = authenticateAdmin;
const errorMessages_1 = require("../utils/errorMessages");
const messageFactory_1 = require("../utils/messageFactory");
const factory = new messageFactory_1.MessageFactory();
/**
 * Middleware per verificare l’autenticazione dell’utente.
 *
 * - Controlla che l’oggetto `req.user` sia presente (inserito da `authenticateToken`).
 * - In caso contrario, restituisce errore HTTP 401 (Unauthorized).
 *
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
function authenticateUser(req, res, next) {
    const user = req.user;
    if (!user) {
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.NOT_USER.status, "Accesso negato. Login richiesto.");
    }
    next();
}
/**
 * Middleware per autorizzare solo gli utenti con ruolo `admin`.
 *
 * - Verifica che l’utente sia autenticato.
 * - Verifica che il campo `role` dell’utente sia `admin`.
 * - In caso contrario, restituisce errore HTTP 403 (Forbidden).
 *
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
function authenticateAdmin(req, res, next) {
    const user = req.user;
    if (!user) {
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.NOT_USER.status, errorMessages_1.ErrorMessages.NOT_USER.message);
    }
    if (user.role !== "admin") {
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.NOT_ADMIN.status, errorMessages_1.ErrorMessages.NOT_ADMIN.message);
    }
    next();
}

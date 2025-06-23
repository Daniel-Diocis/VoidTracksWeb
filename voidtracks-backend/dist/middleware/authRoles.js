"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = authenticateUser;
exports.authenticateAdmin = authenticateAdmin;
const http_status_codes_1 = require("http-status-codes");
const messageFactory_1 = require("../utils/messageFactory");
const factory = new messageFactory_1.MessageFactory();
// Middleware per verificare che l'utente sia autenticato
function authenticateUser(req, res, next) {
    const user = req.user;
    if (!user) {
        return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, "Accesso negato. Login richiesto.");
    }
    next();
}
// Middleware per verificare che l'utente sia autenticato e abbia ruolo admin
function authenticateAdmin(req, res, next) {
    const user = req.user;
    if (!user) {
        return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, "Accesso negato. Login richiesto.");
    }
    if (user.role !== "admin") {
        return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.FORBIDDEN, "Privilegi insufficienti.");
    }
    next();
}

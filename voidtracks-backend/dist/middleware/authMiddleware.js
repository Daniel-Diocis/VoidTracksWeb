"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAuthInput = void 0;
exports.checkUserExists = checkUserExists;
exports.checkUserCredentials = checkUserCredentials;
exports.dailyTokenBonus = dailyTokenBonus;
const express_validator_1 = require("express-validator");
const date_fns_tz_1 = require("date-fns-tz");
const http_status_codes_1 = require("http-status-codes");
const errorMessages_1 = require("../utils/errorMessages");
const messageFactory_1 = require("../utils/messageFactory");
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const timeZone = "Europe/Rome";
const factory = new messageFactory_1.MessageFactory();
/**
 * Middleware di validazione per i campi `username` e `password`.
 *
 * - Verifica che lo username abbia almeno 3 caratteri.
 * - Verifica che la password abbia almeno 6 caratteri.
 * - In caso di errore, restituisce una risposta 400 con dettagli sugli errori.
 */
exports.validateAuthInput = [
    (0, express_validator_1.body)('username')
        .trim()
        .isLength({ min: 3 }).withMessage('Username obbligatorio, almeno 3 caratteri'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 }).withMessage('Password obbligatoria, almeno 6 caratteri'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        }
        next();
    },
];
/**
 * Middleware di verifica per la registrazione utente.
 *
 * - Controlla se lo username esiste già nel database.
 * - In caso positivo, restituisce errore HTTP 409 (Conflict).
 *
 * @param req - Oggetto della richiesta contenente il campo `username`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
async function checkUserExists(req, res, next) {
    try {
        const { username } = req.body;
        const user = await User_1.default.findOne({ where: { username } });
        if (user) {
            return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.USERNAME_ALREADY_EXISTS.status, errorMessages_1.ErrorMessages.USERNAME_ALREADY_EXISTS.message);
        }
        next();
    }
    catch (error) {
        next(error);
    }
}
/**
 * Middleware di autenticazione per il login utente.
 *
 * - Verifica l’esistenza dello username.
 * - Confronta la password fornita con l’hash memorizzato nel DB.
 * - Se le credenziali sono valide, assegna l’oggetto utente a `req.userRecord`.
 *
 * @param req - Oggetto della richiesta contenente `username` e `password`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
async function checkUserCredentials(req, res, next) {
    try {
        const { username, password } = req.body;
        const user = await User_1.default.findOne({ where: { username } });
        if (!user) {
            return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INVALID_CREDENTIALS.status, errorMessages_1.ErrorMessages.INVALID_CREDENTIALS.message);
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INVALID_CREDENTIALS.status, errorMessages_1.ErrorMessages.INVALID_CREDENTIALS.message);
        }
        req.userRecord = user;
        next();
    }
    catch (error) {
        next(error);
    }
}
/**
 * Middleware per l’assegnazione del bonus giornaliero di 1 token.
 *
 * - Verifica se l’utente ha già ricevuto il bonus nella data corrente (fuso orario: Europe/Rome).
 * - In caso negativo, incrementa i token dell’utente e aggiorna `lastTokenBonusDate`.
 * - L’oggetto utente aggiornato viene assegnato a `req.userRecord`.
 *
 * @param req - Oggetto della richiesta contenente `user` da `authenticateToken`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
async function dailyTokenBonus(req, res, next) {
    try {
        const userPayload = req.user;
        if (!userPayload) {
            return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.NOT_AUTHENTICATED_USER.status, errorMessages_1.ErrorMessages.NOT_AUTHENTICATED_USER.message);
        }
        const user = await User_1.default.findByPk(userPayload.id);
        if (!user) {
            return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.USER_NOT_FOUND.status, errorMessages_1.ErrorMessages.USER_NOT_FOUND.message);
        }
        const now = new Date();
        const lastBonusDate = user.lastTokenBonusDate;
        const lastBonusDay = lastBonusDate
            ? (0, date_fns_tz_1.format)((0, date_fns_tz_1.toZonedTime)(lastBonusDate, timeZone), "yyyy-MM-dd")
            : null;
        const today = (0, date_fns_tz_1.format)((0, date_fns_tz_1.toZonedTime)(now, timeZone), "yyyy-MM-dd");
        if (lastBonusDay !== today) {
            user.tokens += 1;
            user.lastTokenBonusDate = now;
            await user.save();
        }
        req.userRecord = user;
        next();
    }
    catch (error) {
        next(error);
    }
}

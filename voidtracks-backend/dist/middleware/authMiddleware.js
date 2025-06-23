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
const messageFactory_1 = require("../utils/messageFactory");
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const timeZone = "Europe/Rome";
const factory = new messageFactory_1.MessageFactory();
/**
 * Middleware di validazione per `username` e `password`.
 *
 * - Controlla che lo username abbia almeno 3 caratteri.
 * - Controlla che la password abbia almeno 6 caratteri.
 * - In caso di errore, restituisce un array di messaggi.
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
 * Middleware di controllo per la registrazione.
 *
 * - Verifica che lo username non sia già presente nel database.
 * - In caso di conflitto, restituisce errore 409.
 *
 * @param req - Oggetto della richiesta HTTP contenente `username`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
async function checkUserExists(req, res, next) {
    try {
        const { username } = req.body;
        const user = await User_1.default.findOne({ where: { username } });
        if (user) {
            return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.CONFLICT, "Username già in uso");
        }
        next();
    }
    catch (error) {
        next(error);
    }
}
/**
 * Middleware di autenticazione per il login.
 *
 * - Verifica che lo username esista.
 * - Confronta la password fornita con l’hash salvato nel DB.
 * - Se valido, aggiunge l’utente completo a `req.userRecord`.
 *
 * @param req - Oggetto della richiesta HTTP contenente `username` e `password`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
async function checkUserCredentials(req, res, next) {
    try {
        const { username, password } = req.body;
        const user = await User_1.default.findOne({ where: { username } });
        if (!user) {
            return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, "Credenziali non valide");
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, "Credenziali non valide");
        }
        req.userRecord = user;
        next();
    }
    catch (error) {
        next(error);
    }
}
/**
 * Middleware per assegnare un token bonus giornaliero.
 *
 * - Controlla se l’utente ha già ricevuto il bonus nella data corrente.
 * - Se non ancora assegnato, incrementa il numero di token e aggiorna la data.
 * - Aggiorna `req.userRecord` con l’utente aggiornato.
 *
 * @param req - Oggetto della richiesta HTTP con `user` allegato dal middleware `authenticateToken`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 */
async function dailyTokenBonus(req, res, next) {
    try {
        const userPayload = req.user;
        if (!userPayload) {
            return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, "Utente non autenticato");
        }
        const user = await User_1.default.findByPk(userPayload.id);
        if (!user) {
            return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.NOT_FOUND, "Utente non trovato");
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

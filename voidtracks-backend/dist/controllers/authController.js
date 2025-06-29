"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getPrivateUser = getPrivateUser;
exports.markNotificationsAsSeen = markNotificationsAsSeen;
const http_status_codes_1 = require("http-status-codes");
const errorMessages_1 = require("../utils/errorMessages");
const messageFactory_1 = require("../utils/messageFactory");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const Notification_1 = __importDefault(require("../models/Notification"));
const fs_1 = __importDefault(require("fs"));
const privateKey = fs_1.default.readFileSync(process.env.PRIVATE_KEY_PATH || "./private.key", "utf8");
const factory = new messageFactory_1.MessageFactory();
/**
 * Registra un nuovo utente nel sistema.
 *
 * - Hasha la password ricevuta in input.
 * - Crea un nuovo record utente con 10 token e ruolo "user".
 * - Genera un token JWT firmato e lo restituisce insieme ai dati utente.
 *
 * @param req - Oggetto della richiesta HTTP, contenente `username` e `password` nel body.
 * @param res - Oggetto della risposta HTTP.
 * @returns Risposta HTTP con il token JWT e i dati dell’utente appena creato.
 */
async function register(req, res, next) {
    try {
        const { username, password } = req.body;
        const saltRounds = 10;
        const password_hash = await bcryptjs_1.default.hash(password, saltRounds);
        const newUser = await User_1.default.create({
            username,
            password_hash,
            tokens: 10,
            role: "user",
        });
        const token = jsonwebtoken_1.default.sign({
            id: newUser.id,
            username: newUser.username,
            role: newUser.role,
            tokens: newUser.tokens,
        }, privateKey, {
            algorithm: "RS256",
            expiresIn: "1h",
        });
        return res.status(http_status_codes_1.StatusCodes.CREATED).json({
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                role: newUser.role,
                tokens: newUser.tokens,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Effettua il login di un utente.
 *
 * - Presuppone che il middleware `checkUserCredentials` abbia verificato le credenziali
 *   e allegato l'utente a `req.userRecord`.
 * - Genera un token JWT e restituisce i dati dell’utente.
 *
 * @param req - Oggetto della richiesta HTTP con `userRecord` settato dal middleware.
 * @param res - Oggetto della risposta HTTP.
 * @returns Risposta HTTP con il token JWT e i dati dell’utente autenticato.
 */
async function login(req, res, next) {
    try {
        const user = req.userRecord;
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            username: user.username,
            role: user.role,
            tokens: user.tokens,
        }, privateKey, {
            algorithm: "RS256",
            expiresIn: "1h",
        });
        return res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                tokens: user.tokens,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Restituisce i dati dell’utente autenticato.
 *
 * - Presuppone che i middleware `verifyToken` e (opzionalmente) `dailyTokenBonus`
 *   abbiano allegato l’oggetto utente aggiornato a `req.userRecord`.
 * - Include anche eventuali notifiche non lette assegnate a `req.unreadNotifications`.
 *
 * @param req - Oggetto della richiesta HTTP contenente `userRecord`.
 * @param res - Oggetto della risposta HTTP.
 * @returns Risposta HTTP con i dati aggiornati dell’utente e le notifiche non lette.
 */
async function getPrivateUser(req, res, next) {
    try {
        const user = req.userRecord;
        const unreadNotifications = req.unreadNotifications || [];
        res.json({
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                tokens: user.tokens,
            },
            notifications: unreadNotifications,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Marca tutte le notifiche non lette dell’utente autenticato come "lette".
 *
 * - Presuppone che il middleware `authenticateToken` abbia popolato `req.user`.
 * - Esegue l’aggiornamento dei record `Notification` corrispondenti.
 *
 * @param req - Oggetto della richiesta HTTP contenente `user`.
 * @param res - Oggetto della risposta HTTP.
 * @returns Risposta HTTP 204 (No Content) in caso di successo.
 */
async function markNotificationsAsSeen(req, res, next) {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.NOT_AUTHENTICATED_USER.status, errorMessages_1.ErrorMessages.NOT_AUTHENTICATED_USER.message);
        }
        await Notification_1.default.update({ seen: true }, { where: { user_id: userId, seen: false } });
        return res.sendStatus(http_status_codes_1.StatusCodes.NO_CONTENT);
    }
    catch (error) {
        next(error);
    }
}

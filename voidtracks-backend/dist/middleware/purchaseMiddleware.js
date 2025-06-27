"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePurchaseBody = validatePurchaseBody;
exports.checkUserAndTrackExist = checkUserAndTrackExist;
exports.checkDuplicatePurchase = checkDuplicatePurchase;
exports.checkUserTokens = checkUserTokens;
exports.validateDownloadToken = validateDownloadToken;
exports.loadPurchaseByToken = loadPurchaseByToken;
const sequelize_1 = require("sequelize");
const http_status_codes_1 = require("http-status-codes");
const errorMessages_1 = require("../utils/errorMessages");
const messageFactory_1 = require("../utils/messageFactory");
const User_1 = __importDefault(require("../models/User"));
const Track_1 = __importDefault(require("../models/Track"));
const Purchase_1 = __importDefault(require("../models/Purchase"));
const factory = new messageFactory_1.MessageFactory();
/**
 * Valida il corpo della richiesta per l'acquisto.
 *
 * Verifica che `track_id` sia presente e sia una stringa.
 *
 * @param req - Oggetto della richiesta HTTP.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Risposta 400 se `track_id` è mancante o non valido.
 */
function validatePurchaseBody(req, res, next) {
    const { track_id } = req.body;
    if (!track_id || typeof track_id !== "string") {
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.TRACK_ID_VALIDATE.status, errorMessages_1.ErrorMessages.TRACK_ID_VALIDATE.message);
    }
    next();
}
/**
 * Verifica l'esistenza dell'utente e del brano nel database.
 *
 * Aggiunge `userInstance` e `trackInstance` all'oggetto `req`.
 *
 * @param req - Oggetto della richiesta HTTP contenente `user.id` e `track_id`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Risposta 404 se utente o brano non esistono.
 */
async function checkUserAndTrackExist(req, res, next) {
    try {
        const userId = req.user.id;
        const { track_id } = req.body;
        const user = await User_1.default.findByPk(userId);
        const track = await Track_1.default.findByPk(track_id);
        if (!user) {
            return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.USER_NOT_FOUND.status, errorMessages_1.ErrorMessages.USER_NOT_FOUND.message);
        }
        if (!track) {
            return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.TRACK_NOT_FOUND.status, errorMessages_1.ErrorMessages.TRACK_NOT_FOUND.message);
        }
        req.userInstance = user;
        req.trackInstance = track;
        next();
    }
    catch (err) {
        next(err);
    }
}
/**
 * Verifica se esiste già un acquisto valido per lo stesso utente e brano.
 *
 * Se esistente, restituisce il token esistente ed evita la duplicazione.
 *
 * @param req - Oggetto della richiesta contenente `user.id` e `track_id`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Risposta 200 con il token già valido se presente.
 */
async function checkDuplicatePurchase(req, res, next) {
    try {
        const userId = req.user.id;
        const { track_id } = req.body;
        const existingPurchase = await Purchase_1.default.findOne({
            where: {
                user_id: userId,
                track_id,
                used_flag: false,
                valid_until: { [sequelize_1.Op.gt]: new Date() },
            },
        });
        if (existingPurchase) {
            return res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Acquisto già presente e valido",
                purchase_id: existingPurchase.id,
                download_token: existingPurchase.download_token,
            });
        }
        next();
    }
    catch (err) {
        next(err);
    }
}
/**
 * Verifica che l'utente disponga di un numero sufficiente di token.
 *
 * Confronta i token dell'utente con il costo del brano.
 *
 * @param req - Oggetto della richiesta contenente `userInstance` e `trackInstance`.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Risposta 401 se i token disponibili non sono sufficienti.
 */
function checkUserTokens(req, res, next) {
    const user = req.userInstance;
    const track = req.trackInstance;
    if (user.tokens < track.costo) {
        return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.UNSUFFICIENT_TOKENS.status, errorMessages_1.ErrorMessages.UNSUFFICIENT_TOKENS.message);
    }
    next();
}
/**
 * Valida il token di download fornito come parametro.
 *
 * Verifica che il token:
 * - Esista
 * - Non sia già stato usato
 * - Non sia scaduto
 *
 * Aggiunge `purchaseInstance` a `req` se valido.
 *
 * @param req - Oggetto della richiesta contenente `download_token` nei parametri.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Risposta 404, 403 o successo.
 */
async function validateDownloadToken(req, res, next) {
    try {
        const { download_token } = req.params;
        const purchase = await Purchase_1.default.findOne({
            where: { download_token },
            include: [Track_1.default],
        });
        if (!purchase) {
            return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INVALID_LINK.status, errorMessages_1.ErrorMessages.INVALID_LINK.message);
        }
        if (purchase.used_flag) {
            return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.ALREADY_USED_LINK.status, errorMessages_1.ErrorMessages.ALREADY_USED_LINK.message);
        }
        if (new Date() > purchase.valid_until) {
            return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.EXPIRED_LINK.status, errorMessages_1.ErrorMessages.EXPIRED_LINK.message);
        }
        req.purchaseInstance = purchase;
        next();
    }
    catch (err) {
        next(err);
    }
}
/**
 * Carica i dettagli dell'acquisto tramite `download_token` senza verificarne la validità.
 *
 * Utile per consultare i dettagli associati al token.
 *
 * @param req - Oggetto della richiesta contenente `download_token` nei parametri.
 * @param res - Oggetto della risposta HTTP.
 * @param next - Funzione per passare al middleware successivo.
 * @returns Risposta 404 se il token è invalido o non associato a un brano.
 */
async function loadPurchaseByToken(req, res, next) {
    try {
        const { download_token } = req.params;
        const purchase = await Purchase_1.default.findOne({
            where: { download_token },
            include: [Track_1.default],
        });
        if (!purchase || !purchase.Track) {
            return factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INVALID_PURCHASE_TOKEN.status, errorMessages_1.ErrorMessages.INVALID_PURCHASE_TOKEN.message);
        }
        req.purchaseInstance = purchase;
        next();
    }
    catch (err) {
        next(err);
    }
}

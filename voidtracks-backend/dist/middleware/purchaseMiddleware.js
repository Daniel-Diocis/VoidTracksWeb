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
const messageFactory_1 = require("../utils/messageFactory");
const User_1 = __importDefault(require("../models/User"));
const Track_1 = __importDefault(require("../models/Track"));
const Purchase_1 = __importDefault(require("../models/Purchase"));
const factory = new messageFactory_1.MessageFactory();
/**
 * Valida il corpo della richiesta per la rotta di acquisto.
 * Verifica che `track_id` sia presente e sia una stringa.
 *
 * @param req - Oggetto Request contenente il corpo della richiesta
 * @param res - Oggetto Response per inviare errori
 * @param next - Funzione per passare al middleware successivo
 */
function validatePurchaseBody(req, res, next) {
    const { track_id } = req.body;
    if (!track_id || typeof track_id !== "string") {
        return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.BAD_REQUEST, "Il campo 'track_id' è obbligatorio e deve essere una stringa");
    }
    next();
}
/**
 * Verifica che l'utente e il brano indicati esistano nel database.
 * Salva le istanze nei campi `userInstance` e `trackInstance` della request.
 *
 * @param req - Oggetto Request con `user.id` e `track_id` dal body
 * @param res - Oggetto Response per inviare errori
 * @param next - Funzione per passare al middleware successivo
 */
async function checkUserAndTrackExist(req, res, next) {
    const userId = req.user.id;
    const { track_id } = req.body;
    const user = await User_1.default.findByPk(userId);
    const track = await Track_1.default.findByPk(track_id);
    if (!user)
        return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.NOT_FOUND, "Utente non trovato");
    if (!track)
        return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.NOT_FOUND, "Brano non trovato");
    req.userInstance = user;
    req.trackInstance = track;
    next();
}
/**
 * Controlla se esiste già un acquisto valido per lo stesso brano e utente.
 * In caso positivo, ritorna subito con il token esistente evitando duplicati.
 *
 * @param req - Oggetto Request con `user.id` e `track_id` dal body
 * @param res - Oggetto Response con token esistente
 * @param next - Funzione per passare al middleware successivo
 */
async function checkDuplicatePurchase(req, res, next) {
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
/**
 * Verifica che l'utente abbia abbastanza token per acquistare il brano.
 *
 * @param req - Oggetto Request contenente `userInstance` e `trackInstance`
 * @param res - Oggetto Response per errore se token insufficienti
 * @param next - Funzione per passare al middleware successivo
 */
function checkUserTokens(req, res, next) {
    const user = req.userInstance;
    const track = req.trackInstance;
    if (user.tokens < track.costo) {
        return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, "Token insufficienti per l'acquisto");
    }
    next();
}
/**
 * Valida il token di download prima di servire il file.
 * Verifica che il token:
 * - Esista
 * - Non sia già usato
 * - Non sia scaduto
 *
 * @param req - Oggetto Request con `download_token` nei parametri
 * @param res - Oggetto Response per eventuali errori
 * @param next - Funzione per passare al middleware successivo
 */
async function validateDownloadToken(req, res, next) {
    const { download_token } = req.params;
    const purchase = await Purchase_1.default.findOne({
        where: { download_token },
        include: [Track_1.default],
    });
    if (!purchase) {
        return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.NOT_FOUND, "Link di download non valido");
    }
    if (purchase.used_flag) {
        return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.FORBIDDEN, "Link già utilizzato");
    }
    if (new Date() > purchase.valid_until) {
        return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.FORBIDDEN, "Link scaduto");
    }
    req.purchaseInstance = purchase;
    next();
}
/**
 * Carica l'acquisto corrispondente al `download_token` fornito.
 * Utilizzato per visualizzare i dettagli (non valida usabilità del token).
 *
 * @param req - Oggetto Request con `download_token` nei parametri
 * @param res - Oggetto Response per eventuali errori
 * @param next - Funzione per passare al middleware successivo
 */
async function loadPurchaseByToken(req, res, next) {
    const { download_token } = req.params;
    const purchase = await Purchase_1.default.findOne({
        where: { download_token },
        include: [Track_1.default],
    });
    if (!purchase || !purchase.Track) {
        return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.NOT_FOUND, "Token non valido");
    }
    req.purchaseInstance = purchase;
    next();
}

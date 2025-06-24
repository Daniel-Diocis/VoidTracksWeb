"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPurchase = createPurchase;
exports.downloadTrack = downloadTrack;
exports.getUserPurchases = getUserPurchases;
exports.getPurchaseDetails = getPurchaseDetails;
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const sequelize_1 = require("sequelize");
const http_status_codes_1 = require("http-status-codes");
const errorMessages_1 = require("../utils/errorMessages");
const messageFactory_1 = require("../utils/messageFactory");
const Track_1 = __importDefault(require("../models/Track"));
const Purchase_1 = __importDefault(require("../models/Purchase"));
dotenv_1.default.config();
const FILE_URL = process.env.FILE_URL;
const factory = new messageFactory_1.MessageFactory();
/**
 * Effettua l'acquisto di un brano musicale.
 *
 * - Scala il numero di token disponibili all'utente.
 * - Registra l'acquisto nel database.
 * - Genera un token temporaneo valido 10 minuti per il download.
 *
 * @param req - Richiesta HTTP contenente `userInstance` e `trackInstance` (iniettati dal middleware).
 * @param res - Risposta HTTP contenente ID acquisto e token di download.
 * @returns Risposta JSON con conferma acquisto e token.
 */
async function createPurchase(req, res) {
    try {
        const user = req.userInstance;
        const track = req.trackInstance;
        user.tokens -= track.costo;
        await user.save();
        const purchase = await Purchase_1.default.create({
            user_id: user.id,
            track_id: track.id,
            purchased_at: new Date(),
            valid_until: new Date(Date.now() + 10 * 60 * 1000),
            used_flag: false,
            costo: track.costo,
            download_token: (0, uuid_1.v4)(),
        });
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            message: "Acquisto completato con successo",
            purchase_id: purchase.id,
            download_token: purchase.download_token,
        });
    }
    catch (error) {
        console.error("Errore nell'acquisto:", error);
        factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INTERNAL_ERROR.status, errorMessages_1.ErrorMessages.INTERNAL_ERROR.message);
    }
}
/**
 * Scarica il brano acquistato utilizzando il token di download.
 *
 * - Marca il token come usato (`used_flag`).
 * - Restituisce il file audio in streaming con intestazioni appropriate.
 *
 * @param req - Richiesta HTTP con `purchaseInstance` popolato dal middleware.
 * @param res - Risposta HTTP con il file MP3 in streaming.
 */
async function downloadTrack(req, res) {
    try {
        const purchase = req.purchaseInstance;
        purchase.used_flag = true;
        await purchase.save();
        const fileUrl = `${FILE_URL}${purchase.Track.music_path}`;
        const response = await axios_1.default.get(fileUrl, { responseType: "stream" });
        res.setHeader("Content-Disposition", `attachment; filename="${purchase.Track.titolo.replace(/[^a-z0-9]/gi, "_")}.mp3"`);
        res.setHeader("Content-Type", "audio/mpeg");
        response.data.pipe(res);
    }
    catch (error) {
        console.error("Errore durante il download:", error);
        factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INTERNAL_ERROR.status, errorMessages_1.ErrorMessages.INTERNAL_ERROR.message);
    }
}
/**
 * Restituisce tutti gli acquisti effettuati da un utente.
 *
 * - È possibile filtrare gli acquisti tramite `fromDate` e `toDate` (opzionali).
 *
 * @param req - Richiesta HTTP contenente `user.id` e filtri opzionali tramite query string.
 * @param res - Risposta HTTP con l’elenco degli acquisti effettuati.
 */
async function getUserPurchases(req, res) {
    try {
        const userId = req.user.id;
        const { fromDate, toDate } = req.query;
        const whereClause = { user_id: userId };
        const purchasedAtConditions = {};
        if (fromDate)
            purchasedAtConditions[sequelize_1.Op.gte] = new Date(fromDate);
        if (toDate)
            purchasedAtConditions[sequelize_1.Op.lte] = new Date(toDate);
        if (Object.keys(purchasedAtConditions).length > 0) {
            whereClause.purchased_at = purchasedAtConditions;
        }
        const purchases = await Purchase_1.default.findAll({
            where: whereClause,
            include: [Track_1.default],
            order: [["purchased_at", "DESC"]],
        });
        res.json({
            message: `Trovati ${purchases.length} acquisti`,
            data: purchases,
        });
    }
    catch (error) {
        console.error("Errore nel recupero acquisti:", error);
        factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INTERNAL_ERROR.status, errorMessages_1.ErrorMessages.INTERNAL_ERROR.message);
    }
}
/**
 * Restituisce i dettagli di un acquisto tramite il token di download.
 *
 * - Verifica se il download è ancora disponibile (token valido e non ancora utilizzato).
 *
 * @param req - Richiesta HTTP contenente `purchaseInstance` fornito dal middleware.
 * @param res - Risposta HTTP con i dettagli del brano e il flag `canDownload`.
 */
async function getPurchaseDetails(req, res) {
    try {
        const purchase = req.purchaseInstance;
        const now = new Date();
        const canDownload = !purchase.used_flag && now < purchase.valid_until;
        res.json({
            titolo: purchase.Track.titolo,
            artista: purchase.Track.artista,
            album: purchase.Track.album,
            cover_path: purchase.Track.cover_path,
            canDownload,
        });
    }
    catch (error) {
        console.error("Errore GET /purchase/:token", error);
        factory.getStatusMessage(res, errorMessages_1.ErrorMessages.INTERNAL_ERROR.status, errorMessages_1.ErrorMessages.INTERNAL_ERROR.message);
    }
}

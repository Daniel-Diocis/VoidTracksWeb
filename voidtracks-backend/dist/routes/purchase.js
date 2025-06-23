"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateToken_1 = require("../middleware/authenticateToken");
const purchaseMiddleware_1 = require("../middleware/purchaseMiddleware");
const purchaseController_1 = require("../controllers/purchaseController");
const router = (0, express_1.Router)();
/**
 * @route POST /purchase
 * @description Permette a un utente autenticato di acquistare un brano.
 *             Esegue la validazione dell'input, verifica l'esistenza dell'utente e del brano,
 *             controlla se l'acquisto è già presente e se l'utente ha token sufficienti.
 * @access Protetto (richiede JWT)
 * @middleware authenticateToken, validatePurchaseBody, checkUserAndTrackExist,
 *            checkDuplicatePurchase, checkUserTokens
 * @controller createPurchase
 */
router.post("/", authenticateToken_1.authenticateToken, purchaseMiddleware_1.validatePurchaseBody, purchaseMiddleware_1.checkUserAndTrackExist, purchaseMiddleware_1.checkDuplicatePurchase, purchaseMiddleware_1.checkUserTokens, purchaseController_1.createPurchase);
/**
 * @route GET /purchase/download/:download_token
 * @description Permette di scaricare il file audio associato all'acquisto,
 *             se il token è valido, non scaduto e non ancora usato.
 * @access Pubblico (il download_token è sufficiente)
 * @middleware validateDownloadToken
 * @controller downloadTrack
 */
router.get("/download/:download_token", purchaseMiddleware_1.validateDownloadToken, purchaseController_1.downloadTrack);
/**
 * @route GET /purchase
 * @description Recupera tutti gli acquisti effettuati dall’utente autenticato.
 *             Può accettare filtri opzionali `fromDate` e `toDate` tramite query string.
 * @access Protetto (richiede JWT)
 * @middleware authenticateToken
 * @controller getUserPurchases
 */
router.get("/", authenticateToken_1.authenticateToken, purchaseController_1.getUserPurchases);
/**
 * @route GET /purchase/:download_token
 * @description Ritorna i dettagli di un acquisto specifico,
 *             utilizzando il token come identificatore.
 *             Non verifica la validità temporale del token.
 * @access Pubblico (per visualizzare anteprima del download)
 * @middleware loadPurchaseByToken
 * @controller getPurchaseDetails
 */
router.get("/:download_token", purchaseMiddleware_1.loadPurchaseByToken, purchaseController_1.getPurchaseDetails);
exports.default = router;

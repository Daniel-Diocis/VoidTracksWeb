"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateToken_1 = require("../middleware/authenticateToken");
const purchaseMiddleware_1 = require("../middleware/purchaseMiddleware");
const purchaseController_1 = require("../controllers/purchaseController");
const router = (0, express_1.Router)();
/**
 * @route POST /purchase
 * @summary Acquisto di un brano musicale.
 *
 * @description
 * Permette a un utente autenticato di acquistare un brano.
 *
 * - Valida i campi `user_id` e `track_id` dal corpo della richiesta.
 * - Verifica l'esistenza dell'utente e del brano.
 * - Controlla se l’acquisto esiste già.
 * - Verifica che l’utente abbia token sufficienti.
 *
 * @middleware authenticateToken - Verifica il token JWT dell’utente.
 * @middleware validatePurchaseBody - Valida il contenuto del body.
 * @middleware checkUserAndTrackExist - Verifica l’esistenza delle entità.
 * @middleware checkDuplicatePurchase - Previene acquisti doppi.
 * @middleware checkUserTokens - Controlla che l’utente abbia abbastanza token.
 * @controller createPurchase - Registra l’acquisto e genera token di download.
 */
router.post("/", authenticateToken_1.authenticateToken, purchaseMiddleware_1.validatePurchaseBody, purchaseMiddleware_1.checkUserAndTrackExist, purchaseMiddleware_1.checkDuplicatePurchase, purchaseMiddleware_1.checkUserTokens, purchaseController_1.createPurchase);
/**
 * @route GET /purchase/download/:download_token
 * @summary Scarica un brano acquistato.
 *
 * @description
 * Permette di scaricare il file audio associato a un acquisto, tramite token temporaneo.
 *
 * - Il token viene validato e controllato (esistenza, scadenza, uso).
 *
 * @middleware validateDownloadToken - Verifica validità e stato del download token.
 * @controller downloadTrack - Gestisce il download o redirect del file.
 */
router.get("/download/:download_token", purchaseMiddleware_1.validateDownloadToken, purchaseController_1.downloadTrack);
/**
 * @route GET /purchase
 * @summary Elenco acquisti dell’utente.
 *
 * @description
 * Restituisce tutti i brani acquistati dall’utente autenticato.
 *
 * - Può includere filtri opzionali `fromDate` e `toDate` tramite query string.
 *
 * @middleware authenticateToken - Verifica l’autenticazione dell’utente.
 * @controller getUserPurchases - Restituisce l’elenco degli acquisti.
 */
router.get("/", authenticateToken_1.authenticateToken, purchaseController_1.getUserPurchases);
/**
 * @route GET /purchase/:download_token
 * @summary Dettagli di un acquisto tramite token.
 *
 * @description
 * Restituisce i dettagli di un acquisto specifico utilizzando un token valido.
 *
 * - Non richiede autenticazione.
 * - Utile per anteprima del download prima dell’effettivo scaricamento.
 *
 * @middleware loadPurchaseByToken - Carica l’acquisto dal token fornito.
 * @controller getPurchaseDetails - Restituisce i dettagli relativi all’acquisto.
 */
router.get("/:download_token", purchaseMiddleware_1.loadPurchaseByToken, purchaseController_1.getPurchaseDetails);
exports.default = router;

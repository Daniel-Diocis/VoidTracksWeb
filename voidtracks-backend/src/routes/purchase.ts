import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken";
import {
  validatePurchaseBody,
  checkUserAndTrackExist,
  checkDuplicatePurchase,
  checkUserTokens,
  validateDownloadToken,
  loadPurchaseByToken
} from "../middleware/purchaseMiddleware";

import {
  createPurchase,
  downloadTrack,
  getUserPurchases,
  getPurchaseDetails,
} from "../controllers/purchaseController";

const router = Router();

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
router.post(
  "/",
  authenticateToken,
  validatePurchaseBody,
  checkUserAndTrackExist,
  checkDuplicatePurchase,
  checkUserTokens,
  createPurchase
);

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
router.get("/download/:download_token", validateDownloadToken, downloadTrack);

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
router.get("/", authenticateToken, getUserPurchases);

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
router.get("/:download_token", loadPurchaseByToken, getPurchaseDetails);

export default router;
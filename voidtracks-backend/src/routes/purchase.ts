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
 * @description Permette a un utente autenticato di acquistare un brano.
 *             Esegue la validazione dell'input, verifica l'esistenza dell'utente e del brano,
 *             controlla se l'acquisto è già presente e se l'utente ha token sufficienti.
 * @access Protetto (richiede JWT)
 * @middleware authenticateToken, validatePurchaseBody, checkUserAndTrackExist,
 *            checkDuplicatePurchase, checkUserTokens
 * @controller createPurchase
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
 * @description Permette di scaricare il file audio associato all'acquisto,
 *             se il token è valido, non scaduto e non ancora usato.
 * @access Pubblico (il download_token è sufficiente)
 * @middleware validateDownloadToken
 * @controller downloadTrack
 */
router.get("/download/:download_token", validateDownloadToken, downloadTrack);

/**
 * @route GET /purchase
 * @description Recupera tutti gli acquisti effettuati dall’utente autenticato.
 *             Può accettare filtri opzionali `fromDate` e `toDate` tramite query string.
 * @access Protetto (richiede JWT)
 * @middleware authenticateToken
 * @controller getUserPurchases
 */
router.get("/", authenticateToken, getUserPurchases);

/**
 * @route GET /purchase/:download_token
 * @description Ritorna i dettagli di un acquisto specifico,
 *             utilizzando il token come identificatore.
 *             Non verifica la validità temporale del token.
 * @access Pubblico (per visualizzare anteprima del download)
 * @middleware loadPurchaseByToken
 * @controller getPurchaseDetails
 */
router.get("/:download_token", loadPurchaseByToken, getPurchaseDetails);

export default router;
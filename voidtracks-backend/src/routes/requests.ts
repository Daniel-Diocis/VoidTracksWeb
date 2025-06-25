import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken";
import {
  validateRequestCreation,
  checkDuplicateRequest,
  checkUserHasTokens,
  checkAlreadyVoted,
  checkHasVoted
} from "../middleware/requestsMiddleware";
import {
  getAllRequests,
  createRequest,
  voteRequest,
  unvoteRequest,
} from "../controllers/requestsController";

const router = Router();

/**
 * @route GET /requests
 * @summary Restituisce tutte le richieste presenti nel sistema.
 * 
 * @description
 * Recupera la lista completa delle richieste di brani attualmente esistenti.
 * 
 * - Richiede autenticazione JWT.
 * - Ordina i risultati per data di creazione decrescente.
 * 
 * @middleware authenticateToken - Verifica l’identità dell’utente.
 * @controller getAllRequests - Recupera tutte le richieste dal DB.
 */
router.get("/", authenticateToken, getAllRequests);

/**
 * @route POST /requests
 * @summary Crea una nuova richiesta di brano.
 * 
 * @description
 * Permette a un utente autenticato di proporre un nuovo brano da aggiungere alla piattaforma.
 * 
 * - Valida i campi `track`, `artist`, `tokens` dal body.
 * - Verifica che non esista una richiesta simile.
 * - Controlla che l’utente abbia token sufficienti per inviare la proposta.
 * 
 * @middleware authenticateToken - Verifica l’identità dell’utente.
 * @middleware validateRequestCreation - Valida i dati della richiesta.
 * @middleware checkDuplicateRequest - Previene richieste duplicate.
 * @middleware checkUserHasTokens - Verifica la disponibilità di token.
 * @controller createRequest - Registra la richiesta nel DB.
 */
router.post(
  "/",
  authenticateToken,
  validateRequestCreation,
  checkDuplicateRequest,
  checkUserHasTokens,
  createRequest
);

/**
 * @route POST /requests/:id/vote
 * @summary Vota una richiesta esistente.
 * 
 * @description
 * Permette a un utente di votare per una richiesta esistente, aumentando la sua priorità.
 * 
 * - L’utente può votare una sola volta per ciascuna richiesta.
 * 
 * @middleware authenticateToken - Verifica l’identità dell’utente.
 * @middleware checkAlreadyVoted - Controlla che l’utente non abbia già votato.
 * @controller voteRequest - Registra il voto per la richiesta indicata.
 */
router.post("/:id/vote", authenticateToken, checkAlreadyVoted, voteRequest);

/**
 * @route DELETE /requests/:id/vote
 * @summary Rimuove un voto da una richiesta.
 * 
 * @description
 * Permette all’utente di annullare il voto dato in precedenza a una richiesta.
 * 
 * - È possibile annullare solo voti già espressi.
 * 
 * @middleware authenticateToken - Verifica l’identità dell’utente.
 * @middleware checkHasVoted - Controlla che l’utente abbia effettivamente votato.
 * @controller unvoteRequest - Elimina il voto associato alla richiesta.
 */
router.delete("/:id/vote", authenticateToken, checkHasVoted, unvoteRequest);

export default router;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateToken_1 = require("../middleware/authenticateToken");
const requestsMiddleware_1 = require("../middleware/requestsMiddleware");
const requestsController_1 = require("../controllers/requestsController");
const router = (0, express_1.Router)();
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
router.get("/", authenticateToken_1.authenticateToken, requestsController_1.getAllRequests);
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
router.post("/", authenticateToken_1.authenticateToken, requestsMiddleware_1.validateRequestCreation, requestsMiddleware_1.checkDuplicateRequest, requestsMiddleware_1.checkUserHasTokens, requestsController_1.createRequest);
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
router.post("/:id/vote", authenticateToken_1.authenticateToken, requestsMiddleware_1.checkAlreadyVoted, requestsController_1.voteRequest);
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
router.delete("/:id/vote", authenticateToken_1.authenticateToken, requestsMiddleware_1.checkHasVoted, requestsController_1.unvoteRequest);
exports.default = router;

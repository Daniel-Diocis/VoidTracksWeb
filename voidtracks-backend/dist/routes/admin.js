"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateToken_1 = require("../middleware/authenticateToken");
const authRoles_1 = require("../middleware/authRoles");
const adminMiddleware_1 = require("../middleware/adminMiddleware");
const requestsMiddleware_1 = require("../middleware/requestsMiddleware");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
/**
 * @route PATCH /admin/recharge
 * @summary Ricarica token a un utente specifico.
 *
 * @description
 * Permette a un amministratore di aggiungere un numero di token a un utente del sistema.
 *
 * - Richiede `username` e `tokens` nel body.
 * - Solo utenti con ruolo `admin` possono eseguire questa operazione.
 *
 * @middleware authenticateToken - Verifica la validità del token JWT.
 * @middleware authenticateAdmin - Verifica che l’utente abbia ruolo admin.
 * @middleware validateRechargeInput - Valida `username` e `tokens`.
 * @controller rechargeTokens - Esegue la ricarica dei token.
 */
router.patch("/recharge", authenticateToken_1.authenticateToken, authRoles_1.authenticateAdmin, adminMiddleware_1.validateRechargeInput, adminController_1.rechargeTokens);
/**
 * @route GET /admin/requests
 * @summary Elenco richieste in attesa di approvazione.
 *
 * @description
 * Recupera tutte le richieste di brani che hanno stato `waiting`,
 * per essere gestite da un amministratore.
 *
 * @middleware authenticateToken - Verifica autenticazione.
 * @middleware authenticateAdmin - Verifica ruolo amministratore.
 * @controller getPendingRequests - Restituisce richieste in attesa.
 */
router.get("/requests", authenticateToken_1.authenticateToken, authRoles_1.authenticateAdmin, adminController_1.getPendingRequests);
/**
 * @route PATCH /admin/requests/:id/approve
 * @summary Approvazione di una richiesta di brano.
 *
 * @description
 * Approva una richiesta di brano, impostando lo stato su `satisfied` e
 * premiando il richiedente con un numero di token specificato.
 *
 * - Richiede il campo `tokensToAdd` nel body.
 * - Solo richieste in stato `waiting` possono essere approvate.
 *
 * @middleware authenticateToken - Verifica autenticazione.
 * @middleware authenticateAdmin - Verifica ruolo amministratore.
 * @middleware checkRequestWaiting - Controlla lo stato della richiesta.
 * @middleware validateTokenAmount - Valida `tokensToAdd` nel body.
 * @controller approveRequest - Approva la richiesta e assegna token.
 */
router.patch("/requests/:id/approve", authenticateToken_1.authenticateToken, authRoles_1.authenticateAdmin, requestsMiddleware_1.checkRequestWaiting, adminMiddleware_1.validateTokenAmount, adminController_1.approveRequest);
/**
 * @route PATCH /admin/requests/:id/reject
 * @summary Rifiuto di una richiesta di brano.
 *
 * @description
 * Rifiuta una richiesta esistente impostandone lo stato su `rejected`.
 * Nessun token viene assegnato.
 *
 * - Solo richieste in stato `waiting` possono essere rifiutate.
 *
 * @middleware authenticateToken - Verifica autenticazione.
 * @middleware authenticateAdmin - Verifica ruolo amministratore.
 * @middleware checkRequestWaiting - Controlla lo stato della richiesta.
 * @controller rejectRequest - Rifiuta la richiesta selezionata.
 */
router.patch("/requests/:id/reject", authenticateToken_1.authenticateToken, authRoles_1.authenticateAdmin, requestsMiddleware_1.checkRequestWaiting, adminController_1.rejectRequest);
exports.default = router;

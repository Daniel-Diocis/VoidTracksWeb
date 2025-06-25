import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken";
import { authenticateAdmin } from "../middleware/authRoles";
import {
  validateRechargeInput,
  validateTokenAmount,
} from "../middleware/adminMiddleware";
import { checkRequestWaiting } from "../middleware/requestsMiddleware";
import {
  rechargeTokens,
  getPendingRequests,
  approveRequest,
  rejectRequest,
} from "../controllers/adminController";

const router = Router();

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
router.patch(
  "/recharge",
  authenticateToken,
  authenticateAdmin,
  validateRechargeInput,
  rechargeTokens
);

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
router.get(
  "/requests",
  authenticateToken,
  authenticateAdmin,
  getPendingRequests
);

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
router.patch(
  "/requests/:id/approve",
  authenticateToken,
  authenticateAdmin,
  checkRequestWaiting,
  validateTokenAmount,
  approveRequest
);

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
router.patch(
  "/requests/:id/reject",
  authenticateToken,
  authenticateAdmin,
  checkRequestWaiting,
  rejectRequest
);

export default router;
import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken";
import { authenticateAdmin } from "../middleware/authRoles";
import { validateRechargeInput } from "../middleware/adminMiddleware";
import { rechargeTokens } from "../controllers/adminController";

const router = Router();

/**
 * @route PATCH /admin/recharge
 * @summary Ricarica token a un utente specifico.
 * 
 * @description
 * Questa rotta consente a un utente con ruolo amministratore di ricaricare i token
 * per un determinato utente nel sistema.
 *
 * - Richiede autenticazione tramite JWT.
 * - Verifica che l’utente abbia ruolo `admin`.
 * - Valida i campi `username` e `tokens` nel corpo della richiesta.
 *
 * @middleware authenticateToken - Verifica la validità del token JWT.
 * @middleware authenticateAdmin - Controlla se l'utente ha ruolo admin.
 * @middleware validateRechargeInput - Valida i dati `username` e `tokens` nel body.
 * @controller rechargeTokens - Esegue l'effettiva ricarica dei token.
 */
router.patch(
  "/recharge",
  authenticateToken,
  authenticateAdmin,
  validateRechargeInput,
  rechargeTokens
);

export default router;
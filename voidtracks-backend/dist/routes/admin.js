"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateToken_1 = require("../middleware/authenticateToken");
const authRoles_1 = require("../middleware/authRoles");
const adminMiddleware_1 = require("../middleware/adminMiddleware");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
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
router.patch("/recharge", authenticateToken_1.authenticateToken, authRoles_1.authenticateAdmin, adminMiddleware_1.validateRechargeInput, adminController_1.rechargeTokens);
exports.default = router;

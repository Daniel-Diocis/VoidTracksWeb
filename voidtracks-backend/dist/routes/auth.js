"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const authenticateToken_1 = require("../middleware/authenticateToken");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
/**
 * @route POST /register
 * @summary Registra un nuovo utente nel sistema.
 *
 * @description
 * - Valida i campi `username` e `password` nel body della richiesta.
 * - Verifica che lo username non sia già in uso.
 * - Registra l'utente e restituisce un token JWT.
 *
 * @middleware validateAuthInput - Controlla che `username` e `password` siano validi.
 * @middleware checkUserExists - Verifica che lo username non sia già registrato.
 * @controller register - Registra l’utente e restituisce il token JWT.
 */
router.post("/register", authMiddleware_1.validateAuthInput, authMiddleware_1.checkUserExists, authController_1.register);
/**
 * @route POST /login
 * @summary Autentica un utente esistente.
 *
 * @description
 * - Valida i campi `username` e `password` nel body della richiesta.
 * - Verifica che le credenziali corrispondano a un utente registrato.
 * - Restituisce un token JWT e i dati dell’utente.
 *
 * @middleware validateAuthInput - Controlla che `username` e `password` siano presenti e validi.
 * @middleware checkUserCredentials - Verifica che le credenziali siano corrette.
 * @controller login - Esegue il login e restituisce il token JWT.
 */
router.post("/login", authMiddleware_1.validateAuthInput, authMiddleware_1.checkUserCredentials, authController_1.login);
/**
 * @route GET /private
 * @summary Restituisce i dati dell’utente autenticato.
 *
 * @description
 * - Richiede un token JWT valido nell'header `Authorization`.
 * - Verifica il token e identifica l'utente.
 * - Assegna un token bonus giornaliero se applicabile.
 * - Restituisce le informazioni aggiornate dell’utente.
 *
 * @middleware authenticateToken - Verifica la validità del token JWT.
 * @middleware dailyTokenBonus - Applica un eventuale bonus giornaliero.
 * @controller getPrivateUser - Restituisce i dati aggiornati dell'utente.
 */
router.get("/private", authenticateToken_1.authenticateToken, authMiddleware_1.dailyTokenBonus, authController_1.getPrivateUser);
exports.default = router;

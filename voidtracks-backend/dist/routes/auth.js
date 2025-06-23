"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const authenticateToken_1 = require("../middleware/authenticateToken");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
/**
 * @route POST /register
 * @description Registra un nuovo utente nel sistema.
 * - Valida i campi `username` e `password`.
 * - Verifica che lo username non sia già utilizzato.
 * - Crea l’utente e restituisce il token JWT.
 */
router.post("/register", authMiddleware_1.validateAuthInput, authMiddleware_1.checkUserExists, authController_1.register);
/**
 * @route POST /login
 * @description Esegue il login di un utente.
 * - Valida i campi `username` e `password`.
 * - Verifica che username e password corrispondano a un utente esistente.
 * - Restituisce un token JWT e i dati utente.
 */
router.post("/login", authMiddleware_1.validateAuthInput, authMiddleware_1.checkUserCredentials, authController_1.login);
/**
 * @route GET /private
 * @description Restituisce i dati dell’utente autenticato.
 * - Verifica il token JWT (middleware `authenticateToken`).
 * - Assegna eventualmente un token bonus giornaliero.
 * - Restituisce i dati aggiornati dell’utente.
 */
router.get("/private", authenticateToken_1.authenticateToken, authMiddleware_1.dailyTokenBonus, authController_1.getPrivateUser);
exports.default = router;

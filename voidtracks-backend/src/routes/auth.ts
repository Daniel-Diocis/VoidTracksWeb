import { Router } from "express";
import { 
  validateAuthInput, 
  checkUserExists, 
  checkUserCredentials, 
  dailyTokenBonus 
} from "../middleware/authMiddleware";
import { authenticateToken } from "../middleware/authenticateToken";
import { register, login, getPrivateUser } from "../controllers/authController";

const router = Router();

/**
 * @route POST /register
 * @description Registra un nuovo utente nel sistema.
 * - Valida i campi `username` e `password`.
 * - Verifica che lo username non sia già utilizzato.
 * - Crea l’utente e restituisce il token JWT.
 */
router.post("/register", validateAuthInput, checkUserExists, register);

/**
 * @route POST /login
 * @description Esegue il login di un utente.
 * - Valida i campi `username` e `password`.
 * - Verifica che username e password corrispondano a un utente esistente.
 * - Restituisce un token JWT e i dati utente.
 */
router.post("/login", validateAuthInput, checkUserCredentials, login);

/**
 * @route GET /private
 * @description Restituisce i dati dell’utente autenticato.
 * - Verifica il token JWT (middleware `authenticateToken`).
 * - Assegna eventualmente un token bonus giornaliero.
 * - Restituisce i dati aggiornati dell’utente.
 */
router.get("/private", authenticateToken, dailyTokenBonus, getPrivateUser);

export default router;
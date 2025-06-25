import { Router } from "express";
import { 
  validateAuthInput, 
  checkUserExists, 
  checkUserCredentials, 
  dailyTokenBonus,
  checkNotifications
} from "../middleware/authMiddleware";
import { authenticateToken } from "../middleware/authenticateToken";
import { register, login, getPrivateUser, markNotificationsAsSeen } from "../controllers/authController";

const router = Router();

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
router.post("/register", validateAuthInput, checkUserExists, register);

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
router.post("/login", validateAuthInput, checkUserCredentials, login);

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
router.get("/private", authenticateToken, dailyTokenBonus, checkNotifications, getPrivateUser);

router.patch("/notifications/mark-as-seen", authenticateToken, markNotificationsAsSeen);

export default router;
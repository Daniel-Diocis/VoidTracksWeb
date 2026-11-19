import { Router } from "express";
import {
  validateTrackQuery,
  logTrackRequest,
} from "../middleware/tracksMiddleware";
import {
  getAllTracks,
  getPopularTracks,
} from "../controllers/tracksController";

const router = Router();

/**
 * @route GET /tracks
 * @summary Restituisce tutti i brani musicali presenti nel sistema.
 * 
 * @description
 * Recupera l’elenco completo dei brani. 
 * Se presente una query `q`, filtra per titolo, artista o album (ricerca case-insensitive).
 * 
 * - Esegue la validazione del parametro `q`.
 * - Registra la richiesta in console se è presente un filtro.
 * 
 * @middleware validateTrackQuery - Valida la query string `q`.
 * @middleware logTrackRequest - Logga la richiesta in caso di filtro attivo.
 * @controller getAllTracks - Restituisce i brani trovati.
 */
router.get("/", validateTrackQuery, logTrackRequest, getAllTracks);

/**
 * @route GET /tracks/popular
 * @summary Restituisce i brani più acquistati.
 * 
 * @description
 * Recupera i 10 brani con il maggior numero di acquisti effettuati dagli utenti.
 * 
 * - I risultati sono ordinati in modo decrescente in base al numero di acquisti.
 * - Non richiede parametri.
 * 
 * @controller getPopularTracks - Calcola e restituisce i brani più popolari.
 */
router.get("/popular", getPopularTracks);

export default router;
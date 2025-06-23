import { Router } from "express";
import {
  getAllTracks,
  getPopularTracks,
} from "../controllers/tracksController";

import {
  validateTrackQuery,
  logTrackRequest,
} from "../middleware/tracksMiddleware";

const router = Router();

/**
 * @route GET /tracks
 * @description Restituisce tutti i brani presenti nel sistema.
 *
 * - Accetta un parametro di ricerca `q` opzionale per filtrare per titolo, artista o album.
 * - Valida il parametro `q` e registra la richiesta in console se presente.
 */
router.get("/", validateTrackQuery, logTrackRequest, getAllTracks);

/**
 * @route GET /tracks/popular
 * @description Restituisce i 10 brani più acquistati dagli utenti.
 *
 * - Non richiede parametri.
 * - I risultati sono ordinati per numero di acquisti in ordine decrescente.
 */
router.get("/popular", getPopularTracks);

export default router;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tracksMiddleware_1 = require("../middleware/tracksMiddleware");
const tracksController_1 = require("../controllers/tracksController");
const router = (0, express_1.Router)();
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
router.get("/", tracksMiddleware_1.validateTrackQuery, tracksMiddleware_1.logTrackRequest, tracksController_1.getAllTracks);
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
router.get("/popular", tracksController_1.getPopularTracks);
exports.default = router;

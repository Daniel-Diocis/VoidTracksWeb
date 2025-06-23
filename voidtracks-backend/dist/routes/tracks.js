"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tracksController_1 = require("../controllers/tracksController");
const tracksMiddleware_1 = require("../middleware/tracksMiddleware");
const router = (0, express_1.Router)();
/**
 * @route GET /tracks
 * @description Restituisce tutti i brani presenti nel sistema.
 *
 * - Accetta un parametro di ricerca `q` opzionale per filtrare per titolo, artista o album.
 * - Valida il parametro `q` e registra la richiesta in console se presente.
 */
router.get("/", tracksMiddleware_1.validateTrackQuery, tracksMiddleware_1.logTrackRequest, tracksController_1.getAllTracks);
/**
 * @route GET /tracks/popular
 * @description Restituisce i 10 brani più acquistati dagli utenti.
 *
 * - Non richiede parametri.
 * - I risultati sono ordinati per numero di acquisti in ordine decrescente.
 */
router.get("/popular", tracksController_1.getPopularTracks);
exports.default = router;

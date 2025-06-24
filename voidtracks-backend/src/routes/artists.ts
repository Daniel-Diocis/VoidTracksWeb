import { Router } from "express";
import { validateArtistName } from "../middleware/artistMiddleware";
import { getAllArtists, getArtistByName } from "../controllers/artistsController";

const router = Router();

/**
 * @route GET /artists
 * @summary Restituisce tutti gli artisti presenti nel database.
 *
 * @description
 * Recupera l'elenco completo di artisti registrati nel sistema.
 * Non richiede parametri o autenticazione.
 *
 * @controller getAllArtists - Controller che interroga il database per tutti gli artisti.
 */
router.get("/", getAllArtists);

/**
 * @route GET /artists/byName/:nome
 * @summary Restituisce un artista e i suoi brani, cercando per nome.
 *
 * @description
 * Effettua una ricerca case-insensitive per nome dell'artista e restituisce i dati dell'artista
 * insieme alla lista dei brani associati.
 *
 * @param {string} nome - Nome dell'artista (parametro URL).
 *
 * @middleware validateArtistName - Verifica che il parametro `nome` sia valido.
 * @controller getArtistByName - Recupera l'artista e i suoi brani.
 */
router.get("/byName/:nome", validateArtistName, getArtistByName);

export default router;
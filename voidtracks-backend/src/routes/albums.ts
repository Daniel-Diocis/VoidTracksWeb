import { Router } from "express";
import { listAlbums, getAlbumTracks } from "../controllers/albumsController";

const router = Router();

/**
 * @route GET /albums
 * @summary Restituisce la lista degli album distinti.
 */
router.get("/", listAlbums);

/**
 * @route GET /albums/:albumName
 * @summary Restituisce i brani appartenenti a un album.
 */
router.get("/:albumName", getAlbumTracks);

export default router;
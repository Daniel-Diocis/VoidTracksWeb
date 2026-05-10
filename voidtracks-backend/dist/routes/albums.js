"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const albumsController_1 = require("../controllers/albumsController");
const router = (0, express_1.Router)();
/**
 * @route GET /albums
 * @summary Restituisce la lista degli album distinti.
 */
router.get("/", albumsController_1.listAlbums);
/**
 * @route GET /albums/:albumName
 * @summary Restituisce i brani appartenenti a un album.
 */
router.get("/:albumName", albumsController_1.getAlbumTracks);
exports.default = router;

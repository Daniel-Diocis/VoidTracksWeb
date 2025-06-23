"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const artistsController_1 = require("../controllers/artistsController");
const router = (0, express_1.Router)();
router.get("/", artistsController_1.getAllArtists);
router.get("/byName/:nome", artistsController_1.getArtistByName);
exports.default = router;

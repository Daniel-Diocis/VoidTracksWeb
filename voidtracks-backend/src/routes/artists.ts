import { Router } from "express";
import { getAllArtists, getArtistByName } from "../controllers/artistsController";

const router = Router();

router.get("/", getAllArtists);
router.get("/byName/:nome", getArtistByName);

export default router;

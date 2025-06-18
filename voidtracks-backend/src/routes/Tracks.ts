import { Router } from 'express';
import { getAllTracks, getPopularTracks } from '../controllers/tracksController';

const router = Router();

router.get('/', getAllTracks);
router.get('/popular', getPopularTracks);

export default router;
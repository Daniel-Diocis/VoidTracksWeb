import { Router } from 'express';
import { authenticateToken } from '../middleware/authenticateToken';
import {
  createPurchase,
  downloadTrack,
  getUserPurchases,
  getPurchaseDetails,
} from '../controllers/purchaseController';

const router = Router();

router.post('/', authenticateToken, createPurchase);
router.get('/download/:download_token', downloadTrack);
router.get('/', authenticateToken, getUserPurchases);
router.get('/:download_token', getPurchaseDetails);

export default router;
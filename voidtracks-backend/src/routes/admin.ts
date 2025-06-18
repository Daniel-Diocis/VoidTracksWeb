import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken';
import { authenticateAdmin } from '../middleware/authRoles';
import * as adminController from '../controllers/adminController';

const router = express.Router();

router.patch('/recharge', authenticateToken, authenticateAdmin, adminController.rechargeTokens);

export default router;
import { Router } from 'express';
import { authenticateToken } from '../middleware/authenticateToken';
import * as authController from '../controllers/authController';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/private', authenticateToken, authController.getPrivateUser);
router.post('/logout', authController.logout);

export default router;
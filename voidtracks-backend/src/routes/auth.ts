import { Router } from "express";
import { validateAuthInput, checkUserExists, checkUserCredentials, dailyTokenBonus } from "../middleware/authMiddleware";
import { authenticateToken } from "../middleware/authenticateToken";
import { register, login, getPrivateUser, logout } from "../controllers/authController";

const router = Router();

router.post("/register", validateAuthInput, checkUserExists, register);
router.post("/login", validateAuthInput, checkUserCredentials, login);
router.get("/private", authenticateToken, dailyTokenBonus, getPrivateUser);
router.post("/logout", logout);

export default router;
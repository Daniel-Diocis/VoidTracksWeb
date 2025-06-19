import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken";
import {
  register,
  login,
  getPrivateUser,
  logout,
} from "../controllers/authController";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/private", authenticateToken, getPrivateUser);
router.post("/logout", logout);

export default router;

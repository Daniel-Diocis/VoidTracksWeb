import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken";
import { authenticateAdmin } from "../middleware/authRoles";
import { rechargeTokens } from "../controllers/adminController";

const router = Router();

router.patch("/recharge", authenticateToken, authenticateAdmin, rechargeTokens);

export default router;

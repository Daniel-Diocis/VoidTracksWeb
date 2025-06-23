"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateToken_1 = require("../middleware/authenticateToken");
const authRoles_1 = require("../middleware/authRoles");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
router.patch("/recharge", authenticateToken_1.authenticateToken, authRoles_1.authenticateAdmin, adminController_1.rechargeTokens);
exports.default = router;

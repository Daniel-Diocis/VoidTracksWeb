import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken";
import {
  validateRequestCreation,
  checkDuplicateRequest,
  checkUserHasTokens,
  checkAlreadyVoted,
  checkHasVoted
} from "../middleware/requestsMiddleware";
import {
  getAllRequests,
  createRequest,
  voteRequest,
  unvoteRequest,
} from "../controllers/requestsController";

const router = Router();

router.get("/", authenticateToken, getAllRequests);

router.post(
  "/",
  authenticateToken,
  validateRequestCreation,
  checkDuplicateRequest,
  checkUserHasTokens,
  createRequest
);

router.post("/:id/vote", authenticateToken, checkAlreadyVoted, voteRequest);
router.delete("/:id/vote", authenticateToken, checkHasVoted, unvoteRequest);

export default router;
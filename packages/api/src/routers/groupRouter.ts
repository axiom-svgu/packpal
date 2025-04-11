import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  createGroup,
  inviteMember,
  updateMemberRole,
} from "../controllers/group";

const router = Router();

// Group creation route
router.post("/", authMiddleware, createGroup);

// Group member management routes
router.post("/:groupId/invite", authMiddleware, inviteMember);
router.put(
  "/:groupId/members/:memberId/role",
  authMiddleware,
  updateMemberRole
);

export default router;

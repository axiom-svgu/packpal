import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  createGroup,
  inviteMember,
  updateMemberRole,
  getGroups,
  getGroupById,
  getGroupMembers,
  removeMember,
  leaveGroup,
} from "../controllers/group";

const router = Router();

// Group creation and retrieval routes
router.get("/", authMiddleware, getGroups);
router.get("/:groupId", authMiddleware, getGroupById);
router.post("/", authMiddleware, createGroup);

// Group member management routes
router.get("/:groupId/members", authMiddleware, getGroupMembers);
router.post("/:groupId/invite", authMiddleware, inviteMember);
router.put(
  "/:groupId/members/:memberId/role",
  authMiddleware,
  updateMemberRole
);
router.delete("/:groupId/members/:memberId", authMiddleware, removeMember);
router.delete("/:groupId/leave", authMiddleware, leaveGroup);

export default router;

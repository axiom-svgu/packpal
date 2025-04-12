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
  transferOwnership,
  deleteGroup,
} from "../controllers/group";

const router = Router();

// Group creation and retrieval routes
router.get("/", authMiddleware, getGroups);
router.get("/:groupId", authMiddleware, getGroupById);
router.post("/", authMiddleware, createGroup);
router.delete("/:groupId", authMiddleware, deleteGroup);

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
router.put(
  "/:groupId/transfer-ownership/:newOwnerId",
  authMiddleware,
  transferOwnership
);

export default router;

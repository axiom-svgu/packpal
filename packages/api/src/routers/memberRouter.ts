import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  getAllMembers,
  getMemberById,
  updateMemberRole,
  removeMember,
} from "../controllers/member";

const router = Router();

// Member routes
router.get("/", authMiddleware, getAllMembers);
router.get("/:memberId", authMiddleware, getMemberById);
router.put("/:memberId/role", authMiddleware, updateMemberRole);
router.delete("/:memberId", authMiddleware, removeMember);

export default router;

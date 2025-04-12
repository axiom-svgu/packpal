import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  createList,
  getGroupLists,
  getListById,
  updateList,
  archiveList,
  deleteList,
} from "../controllers/list";
import {
  createListItem,
  getListItems,
  getListItemById,
  updateListItem,
  deleteListItem,
  assignUserToItem,
  unassignUserFromItem,
} from "../controllers/listItem";

const router = Router();

// List management routes
router.post("/", authMiddleware, createList);
router.get("/group/:groupId", authMiddleware, getGroupLists);
router.get("/:listId", authMiddleware, getListById);
router.put("/:listId", authMiddleware, updateList);
router.patch("/:listId/archive", authMiddleware, archiveList);
router.delete("/:listId", authMiddleware, deleteList);

// List item management routes
router.post("/:listId/items", authMiddleware, createListItem);
router.get("/:listId/items", authMiddleware, getListItems);
router.get("/items/:itemId", authMiddleware, getListItemById);
router.put("/items/:itemId", authMiddleware, updateListItem);
router.delete("/items/:itemId", authMiddleware, deleteListItem);

// List item assignment routes
router.post("/items/:itemId/assign", authMiddleware, assignUserToItem);
router.delete(
  "/items/:itemId/assign/:assigneeId",
  authMiddleware,
  unassignUserFromItem
);

export default router;

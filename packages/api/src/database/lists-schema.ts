import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  text,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { users, groups } from "./schema";

// Define list item status
export const listItemStatusEnum = pgEnum("list_item_status", [
  "todo",
  "in_progress",
  "completed",
]);

// Lists table
export const lists = pgTable(
  "list",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    isArchived: boolean("is_archived").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      groupIdx: index("list_group_id_idx").on(table.groupId),
    };
  }
);

// List items table
export const listItems = pgTable(
  "list_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    listId: uuid("list_id")
      .notNull()
      .references(() => lists.id),
    status: listItemStatusEnum("status").default("todo").notNull(),
    dueDate: timestamp("due_date"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      listIdx: index("list_item_list_id_idx").on(table.listId),
    };
  }
);

// List item assignments
export const listItemAssignments = pgTable(
  "list_item_assignment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listItemId: uuid("list_item_id")
      .notNull()
      .references(() => listItems.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    assignedBy: uuid("assigned_by")
      .notNull()
      .references(() => users.id),
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      listItemUserIdx: index("list_item_user_idx").on(
        table.listItemId,
        table.userId
      ),
    };
  }
);

// Zod schemas for validation
export const insertListSchema = createInsertSchema(lists);
export const selectListSchema = createSelectSchema(lists);
export const insertListItemSchema = createInsertSchema(listItems);
export const selectListItemSchema = createSelectSchema(listItems);
export const insertListItemAssignmentSchema =
  createInsertSchema(listItemAssignments);
export const selectListItemAssignmentSchema =
  createSelectSchema(listItemAssignments);

// Extended schemas for validation
export const listCreationSchema = z.object({
  name: z.string().min(1, "List name is required"),
  description: z.string().optional(),
  groupId: z.string().uuid("Invalid group ID"),
});

export const listUpdateSchema = z.object({
  name: z.string().min(1, "List name is required").optional(),
  description: z.string().optional(),
  isArchived: z.boolean().optional(),
});

export const listItemCreationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "completed"]).optional(),
  dueDate: z.string().optional(),
  assignedTo: z.array(z.string().uuid("Invalid user ID")).optional(),
});

export const listItemUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "completed"]).optional(),
  dueDate: z.string().optional(),
});

export const listItemAssignmentSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
});

// Types from schema
export type List = InferSelectModel<typeof lists>;
export type NewList = InferInsertModel<typeof lists>;
export type ListItem = InferSelectModel<typeof listItems>;
export type NewListItem = InferInsertModel<typeof listItems>;
export type ListItemAssignment = InferSelectModel<typeof listItemAssignments>;
export type NewListItemAssignment = InferInsertModel<
  typeof listItemAssignments
>;
export type ListItemStatus = "todo" | "in_progress" | "completed";

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

// ============================================================================
// Enums
// ============================================================================

// Define group roles
export const groupRoleEnum = pgEnum("group_role", [
  "owner",
  "admin",
  "member",
  "viewer",
]);

// Define list item status
export const listItemStatusEnum = pgEnum("list_item_status", [
  "todo",
  "in_progress",
  "completed",
]);

// ============================================================================
// Base Tables
// ============================================================================

// Users table
export const users = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Groups table
export const groups = pgTable("group", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Group members table
export const groupMembers = pgTable("group_member", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  role: groupRoleEnum("role").notNull().default("member"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// List Related Tables
// ============================================================================

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

// List item assignments table
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

// ============================================================================
// Zod Schemas
// ============================================================================

// Base schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertGroupSchema = createInsertSchema(groups);
export const selectGroupSchema = createSelectSchema(groups);
export const insertGroupMemberSchema = createInsertSchema(groupMembers);
export const selectGroupMemberSchema = createSelectSchema(groupMembers);

// List related schemas
export const insertListSchema = createInsertSchema(lists);
export const selectListSchema = createSelectSchema(lists);
export const insertListItemSchema = createInsertSchema(listItems);
export const selectListItemSchema = createSelectSchema(listItems);
export const insertListItemAssignmentSchema =
  createInsertSchema(listItemAssignments);
export const selectListItemAssignmentSchema =
  createSelectSchema(listItemAssignments);

// ============================================================================
// Extended Validation Schemas
// ============================================================================

// User related schemas
export const userRegistrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Group related schemas
export const groupCreationSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
});

export const groupMemberSchema = z.object({
  email: z.string().email("Valid email is required"),
  role: z.enum(["owner", "admin", "member", "viewer"]),
});

// List related schemas
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

// ============================================================================
// Types
// ============================================================================

// Base types
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Group = InferSelectModel<typeof groups>;
export type NewGroup = InferInsertModel<typeof groups>;
export type GroupMember = InferSelectModel<typeof groupMembers>;
export type NewGroupMember = InferInsertModel<typeof groupMembers>;
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type GroupRole = "owner" | "admin" | "member" | "viewer";

// List related types
export type List = InferSelectModel<typeof lists>;
export type NewList = InferInsertModel<typeof lists>;
export type ListItem = InferSelectModel<typeof listItems>;
export type NewListItem = InferInsertModel<typeof listItems>;
export type ListItemAssignment = InferSelectModel<typeof listItemAssignments>;
export type NewListItemAssignment = InferInsertModel<
  typeof listItemAssignments
>;
export type ListItemStatus = "todo" | "in_progress" | "completed";

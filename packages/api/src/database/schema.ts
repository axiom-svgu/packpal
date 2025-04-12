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
import { relations } from "drizzle-orm";
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

// Define item status
export const itemStatusEnum = pgEnum("item_status", [
  "to_pack",
  "packed",
  "delivered",
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

// Categories table
export const categories = pgTable("category", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Items table
export const items = pgTable("item", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  quantity: varchar("quantity", { length: 50 }).notNull(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Item assignments table
export const itemAssignments = pgTable("item_assignment", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => items.id),
  assignedTo: uuid("assigned_to")
    .notNull()
    .references(() => users.id),
  assignedBy: uuid("assigned_by")
    .notNull()
    .references(() => users.id),
  status: itemStatusEnum("status").notNull().default("to_pack"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relations after all tables are defined
// User relations
export const usersRelations = relations(users, ({ many }) => ({
  assignedItems: many(itemAssignments, { relationName: "userAssignedItems" }),
  assignedByItems: many(itemAssignments, {
    relationName: "userAssignedByItems",
  }),
  groups: many(groupMembers),
}));

// Item relations
export const itemsRelations = relations(items, ({ many, one }) => ({
  assignments: many(itemAssignments),
  category: one(categories, {
    fields: [items.categoryId],
    references: [categories.id],
  }),
  group: one(groups, {
    fields: [items.groupId],
    references: [groups.id],
  }),
  creator: one(users, {
    fields: [items.createdBy],
    references: [users.id],
  }),
}));

// Item assignment relations
export const itemAssignmentsRelations = relations(
  itemAssignments,
  ({ one }) => ({
    item: one(items, {
      fields: [itemAssignments.itemId],
      references: [items.id],
    }),
    assignedTo: one(users, {
      fields: [itemAssignments.assignedTo],
      references: [users.id],
      relationName: "userAssignedItems",
    }),
    assignedBy: one(users, {
      fields: [itemAssignments.assignedBy],
      references: [users.id],
      relationName: "userAssignedByItems",
    }),
  })
);

// Groups table
export const groupsRelations = relations(groups, ({ many }) => ({
  members: many(groupMembers),
  categories: many(categories),
  items: many(items),
}));

// Group members relations
export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));

// Categories relations
export const categoriesRelations = relations(categories, ({ one }) => ({
  group: one(groups, {
    fields: [categories.groupId],
    references: [groups.id],
  }),
  creator: one(users, {
    fields: [categories.createdBy],
    references: [users.id],
  }),
}));

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
    status: itemStatusEnum("status").default("to_pack").notNull(),
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

// List relations
export const listsRelations = relations(lists, ({ one, many }) => ({
  group: one(groups, {
    fields: [lists.groupId],
    references: [groups.id],
  }),
  creator: one(users, {
    fields: [lists.createdBy],
    references: [users.id],
  }),
  items: many(listItems),
}));

// List items relations
export const listItemsRelations = relations(listItems, ({ one, many }) => ({
  list: one(lists, {
    fields: [listItems.listId],
    references: [lists.id],
  }),
  creator: one(users, {
    fields: [listItems.createdBy],
    references: [users.id],
  }),
  assignments: many(listItemAssignments),
}));

// List item assignments relations
export const listItemAssignmentsRelations = relations(
  listItemAssignments,
  ({ one }) => ({
    listItem: one(listItems, {
      fields: [listItemAssignments.listItemId],
      references: [listItems.id],
    }),
    user: one(users, {
      fields: [listItemAssignments.userId],
      references: [users.id],
    }),
    assignedBy: one(users, {
      fields: [listItemAssignments.assignedBy],
      references: [users.id],
    }),
  })
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
  status: z.enum(["to_pack", "packed", "delivered"]).optional(),
  dueDate: z.string().optional(),
  assignedTo: z.array(z.string().uuid("Invalid user ID")).optional(),
});

export const listItemUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  status: z.enum(["to_pack", "packed", "delivered"]).optional(),
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
export type ListItemStatus = "to_pack" | "packed" | "delivered";

// Category types
export type Category = InferSelectModel<typeof categories>;
export type NewCategory = InferInsertModel<typeof categories>;
export const categorySchema = createSelectSchema(categories);
export const insertCategorySchema = createInsertSchema(categories);

// Item types
export type Item = InferSelectModel<typeof items>;
export type NewItem = InferInsertModel<typeof items>;
export const itemSchema = createSelectSchema(items);
export const insertItemSchema = createInsertSchema(items);

// Item assignment types
export type ItemAssignment = InferSelectModel<typeof itemAssignments>;
export type NewItemAssignment = InferInsertModel<typeof itemAssignments>;
export const itemAssignmentSchema = createSelectSchema(itemAssignments);
export const insertItemAssignmentSchema = createInsertSchema(itemAssignments);

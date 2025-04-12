import { eventEmitter } from "../app";

export type UpdateEventType =
  | "item-update"
  | "list-update"
  | "category-update"
  | "group-update"
  | "assignment-update";

/**
 * Emit an event to notify clients about data updates
 * @param type The type of update
 * @param data The updated data
 * @param action The action performed (create, update, delete)
 * @param groupId Optional group ID for filtering events by group
 */
export function emitUpdateEvent(
  type: UpdateEventType,
  data: any,
  action: "create" | "update" | "delete",
  groupId?: string
) {
  const eventData = {
    action,
    groupId,
    timestamp: new Date().toISOString(),
    data,
  };

  eventEmitter.emit(type, eventData);
}

/**
 * Emit an item update event
 */
export function emitItemUpdate(
  itemData: any,
  action: "create" | "update" | "delete",
  groupId?: string
) {
  emitUpdateEvent("item-update", itemData, action, groupId);
}

/**
 * Emit a list update event
 */
export function emitListUpdate(
  listData: any,
  action: "create" | "update" | "delete",
  groupId?: string
) {
  emitUpdateEvent("list-update", listData, action, groupId);
}

/**
 * Emit a category update event
 */
export function emitCategoryUpdate(
  categoryData: any,
  action: "create" | "update" | "delete",
  groupId?: string
) {
  emitUpdateEvent("category-update", categoryData, action, groupId);
}

/**
 * Emit a group update event
 */
export function emitGroupUpdate(
  groupData: any,
  action: "create" | "update" | "delete",
  groupId?: string
) {
  emitUpdateEvent("group-update", groupData, action, groupId);
}

/**
 * Emit an assignment update event
 */
export function emitAssignmentUpdate(
  assignmentData: any,
  action: "create" | "update" | "delete",
  groupId?: string
) {
  emitUpdateEvent("assignment-update", assignmentData, action, groupId);
}

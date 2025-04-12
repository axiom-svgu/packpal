import { get, post, put, del } from "./HttpHelper";
import { ItemAssignment, ItemStatus } from "./types";

export interface CreateItemAssignmentRequest {
  itemId: string;
  assignedTo: string;
  status?: ItemStatus;
  notes?: string;
}

export interface UpdateStatusRequest {
  status: ItemStatus;
}

export const fetchAssignmentsByItem = async (
  itemId: string
): Promise<ItemAssignment[]> => {
  const response = await get<ItemAssignment[]>(
    `/item-assignments/item/${itemId}`
  );
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data || [];
};

export const fetchAssignmentsByUser = async (
  userId: string
): Promise<ItemAssignment[]> => {
  const response = await get<ItemAssignment[]>(
    `/item-assignments/user/${userId}`
  );
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data || [];
};

export const createAssignment = async (
  assignmentData: CreateItemAssignmentRequest
): Promise<ItemAssignment> => {
  const response = await post<ItemAssignment>(
    "/item-assignments",
    assignmentData
  );
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data!;
};

export const updateAssignmentStatus = async (
  assignmentId: string,
  statusData: UpdateStatusRequest
): Promise<ItemAssignment> => {
  const response = await put<ItemAssignment>(
    `/item-assignments/${assignmentId}/status`,
    statusData
  );
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data!;
};

export const deleteAssignment = async (assignmentId: string): Promise<void> => {
  const response = await del<{ message: string }>(
    `/item-assignments/${assignmentId}`
  );
  if (response.error) {
    throw new Error(response.error);
  }
};

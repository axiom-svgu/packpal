import { get, post, put, del } from "./HttpHelper";
import { Item, ApiResponse } from "./types";

export interface CreateItemRequest {
  name: string;
  description?: string;
  quantity: string;
  categoryId: string;
  groupId: string;
}

export interface UpdateItemRequest {
  name?: string;
  description?: string;
  quantity?: string;
  categoryId?: string;
}

export const fetchItemsByGroup = async (groupId: string): Promise<Item[]> => {
  const response = await get<Item[]>(`/items/group/${groupId}`);
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data || [];
};

export const fetchItemsByCategory = async (
  categoryId: string
): Promise<Item[]> => {
  const response = await get<Item[]>(`/items/category/${categoryId}`);
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data || [];
};

export const createItem = async (
  itemData: CreateItemRequest
): Promise<Item> => {
  const response = await post<Item>("/items", itemData);
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data!;
};

export const updateItem = async (
  itemId: string,
  itemData: UpdateItemRequest
): Promise<Item> => {
  const response = await put<Item>(`/items/${itemId}`, itemData);
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data!;
};

export const deleteItem = async (itemId: string): Promise<void> => {
  const response = await del<{ message: string }>(`/items/${itemId}`);
  if (response.error) {
    throw new Error(response.error);
  }
};

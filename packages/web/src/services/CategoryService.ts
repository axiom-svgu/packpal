import { get, post, put, del } from "./HttpHelper";
import { Category } from "./types";

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  groupId: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  groupId?: string;
}

export const fetchCategoriesByGroup = async (
  groupId: string
): Promise<Category[]> => {
  const response = await get<Category[]>(`/categories/group/${groupId}`);
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data || [];
};

export const createCategory = async (
  categoryData: CreateCategoryRequest
): Promise<Category> => {
  const response = await post<Category>("/categories", categoryData);
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data!;
};

export const updateCategory = async (
  categoryId: string,
  categoryData: UpdateCategoryRequest
): Promise<Category> => {
  const response = await put<Category>(
    `/categories/${categoryId}`,
    categoryData
  );
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data!;
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  const response = await del<{ message: string }>(`/categories/${categoryId}`);
  if (response.error) {
    throw new Error(response.error);
  }
};

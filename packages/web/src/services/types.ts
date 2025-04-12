export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

export type ItemStatus = "to_pack" | "packed" | "delivered";

export interface Category {
  id: string;
  name: string;
  description: string | null;
  groupId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  name: string;
  description: string | null;
  quantity: string;
  categoryId: string;
  groupId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  assignments?: ItemAssignment[];
}

export interface ItemAssignment {
  id: string;
  itemId: string;
  assignedTo: string;
  assignedBy: string;
  status: ItemStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  item?: Item;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: "owner" | "admin" | "member" | "viewer";
  joinedAt: string;
  updatedAt: string;
  user?: User;
}

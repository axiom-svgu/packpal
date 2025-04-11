import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Group {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  userId: string;
  groupId: string;
  role: "owner" | "admin" | "member" | "viewer";
  joinedAt: string;
}

interface GroupState {
  currentGroup: Group | null;
  groupRole: "owner" | "admin" | "member" | "viewer" | null;
  groups: Group[];
  setCurrentGroup: (group: Group | null) => void;
  setGroupRole: (role: "owner" | "admin" | "member" | "viewer" | null) => void;
  setGroups: (groups: Group[]) => void;
  addGroup: (group: Group) => void;
  removeGroup: (groupId: string) => void;
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set) => ({
      currentGroup: null,
      groupRole: null,
      groups: [],
      setCurrentGroup: (group) => set({ currentGroup: group }),
      setGroupRole: (role) => set({ groupRole: role }),
      setGroups: (groups) => set({ groups }),
      addGroup: (group) =>
        set((state) => ({ groups: [...state.groups, group] })),
      removeGroup: (groupId) =>
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== groupId),
        })),
    }),
    {
      name: "group-storage",
    }
  )
);

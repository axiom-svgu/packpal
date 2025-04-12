import { get, put, del, post } from "./HttpHelper";
import { ApiResponse } from "./types";

export interface Member {
  id: string;
  userId: string;
  groupId: string;
  role: "owner" | "admin" | "member" | "viewer";
  joinedAt: string;
  name: string;
  email: string;
  groupName?: string;
}

export interface MembersResponse {
  data: Member[];
  success: boolean;
  message: string;
}

export interface MemberResponse {
  data: Member;
  success: boolean;
  message: string;
}

export interface UpdateMemberRoleRequest {
  role: "admin" | "member" | "viewer";
}

export interface AddMemberRequest {
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
  groupId?: string;
}

export const getMembers = async (groupId?: string) => {
  const endpoint = groupId ? `/members?groupId=${groupId}` : "/members";
  return get<ApiResponse<Member[]>>(endpoint);
};

export const getMemberById = async (memberId: string) => {
  return get<ApiResponse<Member>>(`/members/${memberId}`);
};

export const updateMemberRole = async (
  memberId: string,
  data: UpdateMemberRoleRequest
) => {
  return put<ApiResponse<null>>(`/members/${memberId}/role`, data);
};

export const removeMember = async (memberId: string) => {
  return del<ApiResponse<null>>(`/members/${memberId}`);
};

export const addMember = async (data: AddMemberRequest) => {
  return post<ApiResponse<Member>>("/members", data);
};

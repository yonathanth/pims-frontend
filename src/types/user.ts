// User-related types for Tauri v2 backend integration

export type Role = 'Admin' | 'Pharmacist' | 'Assistant';

export type UserDto = {
  userId: number;
  username: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  role: Role;
};

export type CreateUserInput = {
  username: string;
  password: string;
  full_name: string;
  email?: string;
  phone_number?: string;
  role: Role;
};

export type UpdateUserInput = {
  username: string;
  password: string; // NOTE: empty string is interpreted by frontend as 'no change'; backend should ignore if empty
  full_name: string;
  email?: string;
  phone_number?: string;
  role: Role;
};

export type UserViewDto = {
  user: UserDto;
};

export type ListUsersQuery = {
  q?: string; // search by full name, username, email, role name
  role?: Role; // filter by role
  sort_by?: 'name' | 'username';
  descending?: boolean;
  limit?: number; // default 20
  offset?: number; // default 0
};

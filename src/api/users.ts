import { httpClient } from './tauriClient';
import type { CreateUserInput, UpdateUserInput } from '../types/user';

export const listUsers = async (query?: { limit?: number }) => {
  const params = query ? `?limit=${query.limit}` : '';
  const res = await httpClient.get<any>(`/users${params}`);
  // Normalize: backend may return an array or an object { data: [...], meta }
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
};

export const createUser = (input: CreateUserInput) =>
  httpClient.post('/users', {
    username: input.username,
    password: input.password,
    fullName: input.full_name,
    email: input.email,
    phoneNumber: input.phone_number,
    role: input.role?.toUpperCase?.() ?? input.role,
  });

export const updateUser = (id: number, input: UpdateUserInput) =>
  httpClient.patch(`/users/${id}`, {
    username: (input as any).username,
    password: (input as any).password,
    fullName: (input as any).full_name,
    email: (input as any).email,
    phoneNumber: (input as any).phone_number,
    role: (input as any).role?.toUpperCase?.() ?? (input as any).role,
  });

export const deleteUser = (id: number) => httpClient.delete(`/users/${id}`);

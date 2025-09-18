import { httpClient } from './tauriClient';
import type { CreateUserInput, UpdateUserInput } from '../types/user';

export const listUsers = async (query?: { limit?: number }) => {
  const params = query ? `?limit=${query.limit}` : '';
  return httpClient.get<any[]>(`/users${params}`);
};

export const createUser = (input: CreateUserInput) =>
  httpClient.post('/users', {
    username: input.username,
    password: input.password,
    fullName: input.full_name,
    email: input.email,
    role: input.role?.toUpperCase?.() ?? input.role,
  });

export const updateUser = (id: number, input: UpdateUserInput) =>
  httpClient.patch(`/users/${id}`, {
    username: (input as any).username,
    password: (input as any).password,
    fullName: (input as any).full_name,
    email: (input as any).email,
    role: (input as any).role?.toUpperCase?.() ?? (input as any).role,
  });

export const deleteUser = (id: number) => httpClient.delete(`/users/${id}`);

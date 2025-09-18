import { call, httpClient } from './tauriClient';

// Auth types
export type Session = {
  token: string;
  user?: { userId: number; role: string; username: string };
  expires_at?: number | null;
};

export type LoginInput = {
  username: string;
  password: string;
};

// API functions
export const login = async (username: string, password: string) => {
  const res = await httpClient.post<{ accessToken: string }>('/auth/login', {
    usernameOrEmail: username,
    password,
  });
  const token = res.accessToken;
  // Store token so subsequent /auth/me uses Authorization header
  try {
    localStorage.setItem('session', JSON.stringify({ token }));
  } catch {}
  // fetch user info
  const me = await httpClient.get<{
    userId: number;
    role: string;
    username: string;
  }>('/auth/me');
  const session = { token, user: me } as Session;
  try {
    localStorage.setItem('session', JSON.stringify(session));
  } catch {}
  return session;
};

export const logout = async () => {
  await httpClient.post<void>('/auth/logout');
};

export const authStatus = async () => {
  return httpClient.get<{ hasUser: boolean }>('/auth/status');
};

export const setupAdmin = async (payload: {
  username: string;
  password: string;
  fullName?: string;
  email?: string;
}) => {
  return httpClient.post('/auth/setup-admin', payload);
};

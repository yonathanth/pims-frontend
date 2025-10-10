import { httpClient } from './tauriClient';

export interface SetupAdminInput {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
}

export interface SystemConfigInput {
  pharmacyName: string;
  pharmacyAddress?: string;
  pharmacyPhone?: string;
  lowStockThreshold: number;
  expiryWarningDays: number;
  currency: string;
  timezone: string;
}

export interface CompleteSetupInput {
  admin: SetupAdminInput;
  systemConfig: SystemConfigInput;
}

export interface SetupResponse {
  adminUser: {
    id: number;
    username: string;
    fullName: string;
    email: string;
    role: string;
  };
  systemConfig: any;
  message: string;
}

export const completeSetup = (
  input: CompleteSetupInput,
): Promise<SetupResponse> => httpClient.post('/auth/setup', input);

export const getSetupStatus = () => httpClient.get('/auth/status');









import { call } from './tauriClient';

// General Config types
export type GeneralConfigDto = {
  general_config_id: number; // backend field name
  key: string;
  value: string;
  data_type: string;
  category: string;
  description?: string | null;
};

export type CreateGeneralConfigInput = {
  key: string;
  value: string;
  dataType: string;
  category: string;
  description?: string | null;
};

export type UpdateGeneralConfigInput = CreateGeneralConfigInput;

export type ListGeneralConfigsQuery = {
  q?: string;
  category?: string;
  limit?: number;
  offset?: number;
};

// API functions
export const createGeneralConfig = (input: CreateGeneralConfigInput) => {
  return call<GeneralConfigDto>('create_general_config', { input });
};

export const updateGeneralConfig = (
  id: number,
  input: UpdateGeneralConfigInput,
) => {
  return call<GeneralConfigDto>('update_general_config', { id, input });
};

export const deleteGeneralConfig = (id: number) => {
  return call<number>('delete_general_config', { id });
};

export const listGeneralConfigs = (query: ListGeneralConfigsQuery = {}) =>
  call<GeneralConfigDto[]>('list_general_configs', { query });

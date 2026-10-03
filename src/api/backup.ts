import { httpClient } from './tauriClient';
import { loadAppConfig } from '../config/app-config';

const getApiBaseUrl = (): string => {
  const config = loadAppConfig();
  return config.apiBaseUrl;
};

function getAuthToken(): string {
  try {
    const session = localStorage.getItem('session');
    if (session) {
      const sessionData = JSON.parse(session);
      return sessionData.token || '';
    }
    return '';
  } catch {
    return '';
  }
}

export interface ExistingDataCheck {
  hasData: boolean;
  recordCounts: {
    transactions?: number;
    drugs?: number;
    batches?: number;
    users?: number;
  };
}

export async function createBackup(): Promise<void> {
  const apiBase = getApiBaseUrl();
  const url = `${apiBase}/backup/create`;

  const response = await fetch(url, {
    method: 'POST',
    // Note: Backup endpoint is public, no auth needed
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create backup');
  }

  // Get filename from Content-Disposition header
  const contentDisposition = response.headers.get('Content-Disposition');
  const filename = contentDisposition
    ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') ||
      `pims_backup_${Date.now()}.dump`
    : `pims_backup_${Date.now()}.dump`;

  // Download the file
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

export async function checkExistingData(): Promise<ExistingDataCheck> {
  return httpClient.get<ExistingDataCheck>('/backup/check-existing-data');
}

export async function restoreBackup(file: File): Promise<void> {
  const apiBase = getApiBaseUrl();
  const url = `${apiBase}/backup/restore`;

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to restore backup');
  }

  return response.json();
}











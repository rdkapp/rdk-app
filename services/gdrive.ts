
import { DriveFile } from '../types';

const BASE_URL = 'https://www.googleapis.com/drive/v3';
const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';

async function authorizedFetch(url: string, options: RequestInit, accessToken: string) {
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${accessToken}`);

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const error = await response.json();
    console.error('Google Drive API Error:', error);
    throw new Error(error.error?.message || 'An unknown Google Drive API error occurred.');
  }

  return response;
}

export async function listDbFiles(accessToken: string): Promise<DriveFile[]> {
  const q = "mimeType='application/octet-stream' and trashed=false and name ends with '.db'";
  const url = `${BASE_URL}/files?pageSize=100&fields=files(id,name,modifiedTime)&q=${encodeURIComponent(q)}&orderBy=modifiedTime desc`;
  const res = await authorizedFetch(url, {}, accessToken);
  const data = await res.json();
  return data.files || [];
}

export async function getFileContent(fileId: string, accessToken: string): Promise<string> {
  const url = `${BASE_URL}/files/${fileId}?alt=media`;
  const res = await authorizedFetch(url, {}, accessToken);
  return await res.text();
}

export async function createFile(name: string, content: string, accessToken: string): Promise<{id: string}> {
  const metadata = { name, mimeType: 'application/octet-stream' };
  const blob = new Blob([content], { type: 'application/octet-stream' });
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', blob);

  const url = `${UPLOAD_URL}/files?uploadType=multipart&fields=id`;
  const res = await authorizedFetch(url, { method: 'POST', body: form }, accessToken);
  return await res.json();
}

export async function updateFileContent(fileId: string, content: string, accessToken: string): Promise<Response> {
  const blob = new Blob([content], { type: 'application/octet-stream' });
  const url = `${UPLOAD_URL}/files/${fileId}?uploadType=media`;
  return await authorizedFetch(url, { method: 'PATCH', body: blob }, accessToken);
}

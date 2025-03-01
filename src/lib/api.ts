
import { FileInfo } from '@/components/FileList';

const SERVER_URL = 'http://localhost:8080'; // Фиксированный URL сервера

export const uploadFile = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${SERVER_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload file');
  }
};

export const listFiles = async (): Promise<FileInfo[]> => {
  const response = await fetch(`${SERVER_URL}/api/files`);
  
  if (!response.ok) {
    throw new Error('Failed to list files');
  }
  
  return await response.json();
};

export const deleteFile = async (fileName: string): Promise<void> => {
  const response = await fetch(`${SERVER_URL}/api/files/${encodeURIComponent(fileName)}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete file');
  }
};

export const downloadFile = async (fileName: string): Promise<void> => {
  const response = await fetch(`${SERVER_URL}/api/files/${encodeURIComponent(fileName)}`);
  
  if (!response.ok) {
    throw new Error('Failed to download file');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};

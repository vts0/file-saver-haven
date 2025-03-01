
import { FileInfo } from '@/components/FileList';
import { toast } from 'sonner';

const SERVER_URL = 'http://localhost:8080'; // Fixed server URL

export const uploadFile = async (file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${SERVER_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload file: ${errorText || response.statusText}`);
    }
  } catch (error) {
    console.error('Upload error:', error);
    toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Server connection error'}`);
    throw error;
  }
};

export const listFiles = async (): Promise<FileInfo[]> => {
  try {
    const response = await fetch(`${SERVER_URL}/api/files`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to list files: ${errorText || response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('List files error:', error);
    // Don't show toast here as it can get annoying with automatic refreshes
    return [];
  }
};

export const deleteFile = async (fileName: string): Promise<void> => {
  try {
    const response = await fetch(`${SERVER_URL}/api/files/${encodeURIComponent(fileName)}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete file: ${errorText || response.statusText}`);
    }
  } catch (error) {
    console.error('Delete error:', error);
    toast.error(`Delete failed: ${error instanceof Error ? error.message : 'Server connection error'}`);
    throw error;
  }
};

export const downloadFile = async (fileName: string): Promise<void> => {
  try {
    const response = await fetch(`${SERVER_URL}/api/files/${encodeURIComponent(fileName)}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to download file: ${errorText || response.statusText}`);
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    toast.error(`Download failed: ${error instanceof Error ? error.message : 'Server connection error'}`);
    throw error;
  }
};

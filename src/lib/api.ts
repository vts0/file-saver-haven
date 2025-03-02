
import { FileInfo } from '@/components/FileList';

const BASE_URL = 'http://localhost';

// Helper function to check if the server is running
export const checkServerStatus = async (port: number): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}:${port}/api/files`, {
      method: 'GET',
      // Use a short timeout to avoid long waits
      signal: AbortSignal.timeout(2000)
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const startServer = async (port: number): Promise<string> => {
  try {
    // Attempt to launch the Go server via exec or spawn
    // This is a frontend simulation for now since we can't directly launch Go from the browser
    
    // For demonstration, we'll display a message about how to start the server manually
    console.log('To start the server manually, run:');
    console.log(`cd public/go && go run main.go -port ${port}`);
    
    // Check if the server is already running
    const isRunning = await checkServerStatus(port);
    if (!isRunning) {
      throw new Error(`Server not running at port ${port}. Please start it manually.`);
    }
    
    // Return the server URL if running
    return `${BASE_URL}:${port}`;
  } catch (error) {
    // Propagate the error to be handled by the caller
    throw error;
  }
};

export const uploadFile = async (file: File, serverUrl: string): Promise<void> => {
  // Upload file to Go server
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${serverUrl}/api/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to upload file: ${response.statusText}`);
  }
};

export const listFiles = async (serverUrl: string): Promise<FileInfo[]> => {
  try {
    const response = await fetch(`${serverUrl}/api/files`);
    
    if (!response.ok) {
      throw new Error(`Failed to list files: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('List files error:', error);
    
    // For demonstration, if the server is not available, return simulated files from localStorage
    const storedFiles = localStorage.getItem('files');
    if (storedFiles) {
      return JSON.parse(storedFiles);
    }
    return [];
  }
};

export const deleteFile = async (fileName: string, serverUrl: string): Promise<void> => {
  const response = await fetch(`${serverUrl}/api/files/${encodeURIComponent(fileName)}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete file: ${response.statusText}`);
  }
};

export const downloadFile = async (fileName: string, serverUrl: string): Promise<void> => {
  const response = await fetch(`${serverUrl}/api/files/${encodeURIComponent(fileName)}`);
  
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Helper function to save a file to localStorage (for demo purposes)
export const saveFileToLocalStorage = (file: File): void => {
  const storedFiles = localStorage.getItem('files');
  const files = storedFiles ? JSON.parse(storedFiles) as FileInfo[] : [];
  
  // Check if file already exists
  const existingIndex = files.findIndex(f => f.name === file.name);
  
  const newFile: FileInfo = {
    name: file.name,
    size: file.size,
    uploadDate: new Date().toISOString(),
  };
  
  if (existingIndex >= 0) {
    files[existingIndex] = newFile;
  } else {
    files.push(newFile);
  }
  
  localStorage.setItem('files', JSON.stringify(files));
};

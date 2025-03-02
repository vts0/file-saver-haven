
import { FileInfo } from '@/components/FileList';
import { simulateLaunchServer } from '@/server/browser-api';

const BASE_URL = 'http://localhost';

// Helper function to check if the server is running
export const checkServerStatus = async (port: number): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}:${port}/api/files`, {
      method: 'HEAD', // Use HEAD request to avoid fetching all files data
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
    // First check if the server is already running
    const isRunning = await checkServerStatus(port);
    if (isRunning) {
      return `${BASE_URL}:${port}`;
    }
    
    // Simulate launching the Go server (since we can't actually launch it from the browser)
    await simulateLaunchServer(port);
    
    // Display instructions for manual server startup
    console.log('To start the server manually, run:');
    console.log(`cd public/go && go run main.go -port ${port}`);
    
    // Check if the server is running (may be manually started following instructions)
    for (let i = 0; i < 5; i++) {
      // Wait a bit before checking
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const serverRunning = await checkServerStatus(port);
      if (serverRunning) {
        return `${BASE_URL}:${port}`;
      }
    }
    
    throw new Error(`Server not running at port ${port}. Please start it manually.`);
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

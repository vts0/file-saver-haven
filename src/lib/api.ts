import { FileInfo } from '@/components/FileList';
import { invoke } from '@tauri-apps/api/tauri';
import { Command } from '@tauri-apps/api/shell';

const BASE_URL = 'http://localhost';

// Helper function to check if the server is running
export const checkServerStatus = async (port: number): Promise<boolean> => {
  try {
    // Use a GET request to the status endpoint
    const response = await fetch(`${BASE_URL}:${port}/api/status`, {
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
    // First check if the server is already running
    const isRunning = await checkServerStatus(port);
    if (isRunning) {
      return `${BASE_URL}:${port}`;
    }
    
    try {
      // Use Tauri's Command API to start the Go server
      // In a monolithic approach, we'll use a built Go binary
      const command = Command.sidecar('file-storage-server', ['--port', port.toString()]);
      
      // Execute the command
      const child = await command.spawn();
      
      console.log('Go server process started with ID:', child.pid);
      
      // Wait for the server to start
      for (let i = 0; i < 15; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const serverRunning = await checkServerStatus(port);
        if (serverRunning) {
          return `${BASE_URL}:${port}`;
        }
      }
      
      throw new Error(`Server did not start at port ${port} within the expected time.`);
    } catch (error) {
      console.error('Failed to start server:', error);
      
      // Fallback: Display instructions for manual server startup
      console.log('To start the server manually, run:');
      console.log(`cd public/go && go build -o file-storage-server main.go && ./file-storage-server -port ${port}`);
      
      throw new Error(`Failed to start server: ${error}`);
    }
  } catch (error) {
    // Propagate the error to be handled by the caller
    throw error;
  }
};

// The rest of the API functions remain the same as they now communicate with the monolithic server
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

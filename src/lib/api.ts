
import { FileInfo } from '@/components/FileList';

const BASE_URL = 'http://localhost';

export const startServer = async (port: number): Promise<string> => {
  // This is a frontend simulation of starting a Go server
  // In a real application, this would make an API call to start the backend server
  
  // Simulate server startup delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real application, the Go server would return its URL
  return `${BASE_URL}:${port}`;
};

export const uploadFile = async (file: File, serverUrl: string): Promise<void> => {
  // Simulate file upload to Go server
  const formData = new FormData();
  formData.append('file', file);
  
  // In a real application, this would be an actual fetch request
  // await fetch(`${serverUrl}/api/upload`, {
  //   method: 'POST',
  //   body: formData,
  // });
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
};

export const listFiles = async (serverUrl: string): Promise<FileInfo[]> => {
  // In a real application, this would fetch the file list from the Go server
  // const response = await fetch(`${serverUrl}/api/files`);
  // return await response.json();
  
  // For demonstration, return simulated files based on localStorage
  const storedFiles = localStorage.getItem('files');
  if (storedFiles) {
    return JSON.parse(storedFiles);
  }
  return [];
};

export const deleteFile = async (fileName: string, serverUrl: string): Promise<void> => {
  // In a real application, this would delete the file via the Go server
  // await fetch(`${serverUrl}/api/files/${encodeURIComponent(fileName)}`, {
  //   method: 'DELETE',
  // });
  
  // For demonstration, update localStorage
  const storedFiles = localStorage.getItem('files');
  if (storedFiles) {
    const files = JSON.parse(storedFiles) as FileInfo[];
    const updatedFiles = files.filter(file => file.name !== fileName);
    localStorage.setItem('files', JSON.stringify(updatedFiles));
  }
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
};

export const downloadFile = async (fileName: string, serverUrl: string): Promise<void> => {
  // In a real application, this would download the file from the Go server
  // const response = await fetch(`${serverUrl}/api/files/${encodeURIComponent(fileName)}`);
  // const blob = await response.blob();
  // const url = window.URL.createObjectURL(blob);
  // const a = document.createElement('a');
  // a.href = url;
  // a.download = fileName;
  // a.click();
  // window.URL.revokeObjectURL(url);
  
  // For demonstration, just simulate a download
  console.log(`Downloading ${fileName}`);
  await new Promise(resolve => setTimeout(resolve, 800));
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


import React, { useState, useEffect, useCallback } from 'react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import FileDropzone from '@/components/FileDropzone';
import FileList, { FileInfo } from '@/components/FileList';
import ServerConfig from '@/components/ServerConfig';
import { 
  startServer, 
  uploadFile, 
  listFiles, 
  deleteFile, 
  downloadFile,
  saveFileToLocalStorage,
  checkServerStatus
} from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const queryClient = useQueryClient();
  const [serverUrl, setServerUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [isServerChecking, setIsServerChecking] = useState<boolean>(true);
  
  // Check if server is already running on load
  useEffect(() => {
    const checkServer = async () => {
      try {
        setIsServerChecking(true);
        const isRunning = await checkServerStatus(8080);
        if (isRunning) {
          setServerUrl('http://localhost:8080');
          queryClient.invalidateQueries({ queryKey: ['files'] });
        }
      } catch (error) {
        console.error('Server check error:', error);
      } finally {
        setIsServerChecking(false);
      }
    };
    
    checkServer();
  }, [queryClient]);
  
  // Server start mutation
  const serverStartMutation = useMutation({
    mutationFn: startServer,
    onSuccess: (url) => {
      setServerUrl(url);
      toast.success('Server started successfully');
      // Trigger files fetch when server starts
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error: any) => {
      toast.error(`Server start failed: ${error.message}`);
    }
  });
  
  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!serverUrl) throw new Error('Server not started');
      await uploadFile(file, serverUrl);
      // For demo purposes, save to localStorage
      saveFileToLocalStorage(file);
    },
    onSuccess: () => {
      toast.success('File uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error: any) => {
      toast.error(`Upload failed: ${error.message}`);
    }
  });
  
  // File delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (fileName: string) => {
      if (!serverUrl) throw new Error('Server not started');
      await deleteFile(fileName, serverUrl);
    },
    onSuccess: () => {
      toast.success('File deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error: any) => {
      toast.error(`Delete failed: ${error.message}`);
    }
  });
  
  // Download file mutation
  const downloadMutation = useMutation({
    mutationFn: async (fileName: string) => {
      if (!serverUrl) throw new Error('Server not started');
      await downloadFile(fileName, serverUrl);
    },
    onSuccess: () => {
      toast.success('File downloaded successfully');
    },
    onError: (error: any) => {
      toast.error(`Download failed: ${error.message}`);
    }
  });
  
  // Query to fetch files
  const { data: files = [], isLoading } = useQuery({
    queryKey: ['files'],
    queryFn: async () => {
      if (!serverUrl) return [];
      return listFiles(serverUrl);
    },
    enabled: !!serverUrl,
    refetchInterval: 10000, // Refresh every 10 seconds
  });
  
  // Handlers
  const handleServerStart = useCallback(async (port: number) => {
    try {
      return await serverStartMutation.mutateAsync(port);
    } catch (error) {
      // Error is already handled in the onError callback
      throw error;
    }
  }, [serverStartMutation]);
  
  const handleFileUpload = useCallback(async (file: File) => {
    await uploadMutation.mutateAsync(file);
  }, [uploadMutation]);
  
  const handleDeleteFile = useCallback(async (fileName: string) => {
    await deleteMutation.mutateAsync(fileName);
  }, [deleteMutation]);
  
  const handleDownloadFile = useCallback(async (fileName: string) => {
    await downloadMutation.mutateAsync(fileName);
  }, [downloadMutation]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-2 tracking-tight animate-fade-in">
            File Storage Haven
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto animate-slide-up">
            A minimalist file manager with elegant design and smooth user experience
          </p>
        </header>
        
        <div className="space-y-10">
          {/* Server Configuration Section - Show when server is not running */}
          {!serverUrl && !isServerChecking && (
            <section className="animate-fade-in">
              <ServerConfig 
                onServerStart={handleServerStart} 
                className="max-w-xl mx-auto"
              />
            </section>
          )}
          
          {/* Loading state while checking server */}
          {isServerChecking && (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-3">Checking server status...</span>
            </div>
          )}
          
          {/* File Manager Section - Only show when server is running */}
          {serverUrl && (
            <section id="file-manager" className="animate-fade-in">
              <div className="bg-background/80 backdrop-blur-md rounded-xl border border-border p-6 shadow-sm">
                <Tabs 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload File
                    </TabsTrigger>
                    <TabsTrigger value="list" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      File List {files.length > 0 && `(${files.length})`}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload" className="mt-0 space-y-4 animate-fade-in">
                    <FileDropzone onFileUpload={handleFileUpload} />
                  </TabsContent>
                  
                  <TabsContent value="list" className="mt-0 animate-fade-in">
                    <FileList 
                      files={files}
                      onDeleteFile={handleDeleteFile}
                      onDownloadFile={handleDownloadFile}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </section>
          )}
        </div>
      </div>
      
      <footer className="py-6 border-t mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>File Storage Haven © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;


import React, { useState, useEffect, useCallback } from 'react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import FileDropzone from '@/components/FileDropzone';
import FileList, { FileInfo } from '@/components/FileList';
import { 
  uploadFile, 
  listFiles, 
  deleteFile, 
  downloadFile
} from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText } from 'lucide-react';

const Index: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('upload');
  
  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      await uploadFile(file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    }
  });
  
  // File delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (fileName: string) => {
      await deleteFile(fileName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    }
  });
  
  // Download file mutation
  const downloadMutation = useMutation({
    mutationFn: async (fileName: string) => {
      await downloadFile(fileName);
    }
  });
  
  // Query to fetch files
  const { data: files = [], refetch } = useQuery({
    queryKey: ['files'],
    queryFn: async () => {
      return listFiles();
    },
  });
  
  // Periodically refresh the file list (every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [refetch]);
  
  // Handlers
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
          {/* File Manager Section */}
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
        </div>
      </div>
      
      <footer className="py-6 border-t mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>File Storage Haven © {new Date().getFullYear()}</p>
          <p className="mt-1">HTTP Server running at: http://localhost:8080</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

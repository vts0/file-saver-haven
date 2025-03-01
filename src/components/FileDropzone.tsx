
import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Upload, X, FileText, Check, ServerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FileDropzoneProps {
  onFileUpload: (file: File) => Promise<void>;
  className?: string;
  isUploading?: boolean;
  isServerOnline?: boolean;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ 
  onFileUpload, 
  className, 
  isUploading = false, 
  isServerOnline = true 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setUploadSuccess(false);
    }
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setUploadSuccess(false);
    }
  }, []);

  const handleClickUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedFile(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;
    
    if (!isServerOnline) {
      toast.error('Cannot upload: Server is offline');
      return;
    }
    
    try {
      await onFileUpload(selectedFile);
      setUploadSuccess(true);
    } catch (error) {
      console.error('Upload failed:', error);
      // Toast is shown in the API function
    }
  }, [selectedFile, onFileUpload, isServerOnline]);

  return (
    <div className={cn(
      'transition-smooth rounded-xl',
      className
    )}>
      <div 
        className={cn(
          'relative flex flex-col items-center justify-center w-full p-6 rounded-xl glass-card overflow-hidden transition-smooth',
          isDragging ? 'border-primary border-2 bg-primary/5' : 'border border-border',
          !isServerOnline ? 'opacity-75 pointer-events-none' : ''
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!isServerOnline && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex flex-col items-center p-4 text-center">
              <ServerOff className="w-10 h-10 text-destructive mb-2" />
              <h3 className="text-lg font-medium">Server Offline</h3>
              <p className="text-sm text-muted-foreground">Cannot upload files while server is offline</p>
            </div>
          </div>
        )}
        
        {!selectedFile ? (
          <>
            <Upload className="w-10 h-10 mb-4 text-primary animate-float" />
            <h3 className="text-lg font-medium mb-2">Drag & Drop File</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              or click to browse your files
            </p>
            <Button
              type="button"
              onClick={handleClickUpload}
              className="transition-smooth"
              variant="secondary"
              disabled={!isServerOnline}
            >
              Select File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileInputChange}
              disabled={!isServerOnline}
            />
          </>
        ) : (
          <div className="w-full animate-fade-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary" />
                <div className="flex flex-col">
                  <p className="font-medium text-sm truncate max-w-[200px] sm:max-w-xs">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={handleClearSelection}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-end gap-2">
              {uploadSuccess ? (
                <Button variant="outline" className="gap-1 text-green-600" disabled>
                  <Check className="h-4 w-4" />
                  Uploaded
                </Button>
              ) : (
                <Button 
                  onClick={handleUpload} 
                  disabled={isUploading || !isServerOnline}
                  className="transition-smooth"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDropzone;

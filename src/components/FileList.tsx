
import React from 'react';
import { FileIcon, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface FileInfo {
  name: string;
  size: number;
  uploadDate: string;
}

interface FileListProps {
  files: FileInfo[];
  onDeleteFile: (fileName: string) => Promise<void>;
  onDownloadFile: (fileName: string) => Promise<void>;
  className?: string;
}

const FileList: React.FC<FileListProps> = ({
  files,
  onDeleteFile,
  onDownloadFile,
  className
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDelete = async (fileName: string) => {
    try {
      await onDeleteFile(fileName);
      toast.success(`${fileName} deleted successfully`);
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleDownload = async (fileName: string) => {
    try {
      await onDownloadFile(fileName);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download file');
    }
  };

  return (
    <div className={cn('rounded-xl glass-card p-1', className)}>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Files</h2>
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileIcon className="w-10 h-10 text-muted-foreground mb-3 opacity-40" />
            <p className="text-muted-foreground">No files uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {files.map((file) => (
              <div
                key={file.name}
                className="relative p-3 rounded-lg bg-background border border-border transition-smooth group hover:border-primary/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center min-w-0 flex-1">
                    <FileIcon className="h-5 w-5 text-primary flex-shrink-0 mr-3" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{file.name}</p>
                      <div className="flex text-xs text-muted-foreground mt-1 space-x-2">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{formatDate(file.uploadDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleDownload(file.name)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(file.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileList;

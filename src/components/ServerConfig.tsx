
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Server, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface ServerConfigProps {
  onServerStart: (port: number) => Promise<string>;
  className?: string;
}

const ServerConfig: React.FC<ServerConfigProps> = ({ onServerStart, className }) => {
  const [port, setPort] = useState<string>('8080');
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [serverUrl, setServerUrl] = useState<string>('');

  const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/\D/g, '');
    setPort(value);
  };

  const handleStartServer = async () => {
    try {
      setIsStarting(true);
      const portNumber = parseInt(port, 10);
      
      if (isNaN(portNumber) || portNumber < 1024 || portNumber > 65535) {
        toast.error('Please enter a valid port number (1024-65535)');
        return;
      }
      
      const url = await onServerStart(portNumber);
      setServerUrl(url);
      toast.success(`Server started successfully on port ${portNumber}`);
    } catch (error) {
      console.error('Server start failed:', error);
      toast.error('Failed to start server');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className={cn('rounded-xl glass-card p-6', className)}>
      <div className="flex items-center gap-3 mb-4">
        <Server className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Server Configuration</h2>
      </div>
      
      {!serverUrl ? (
        <div className="space-y-4 animate-fade-in">
          <div>
            <label htmlFor="port" className="block text-sm font-medium mb-1">
              Port Number
            </label>
            <Input
              id="port"
              value={port}
              onChange={handlePortChange}
              placeholder="Enter port number"
              className="transition-smooth"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Recommended to use ports above 1024
            </p>
          </div>
          <Button 
            onClick={handleStartServer} 
            disabled={isStarting || !port}
            className="w-full transition-smooth"
          >
            {isStarting ? 'Starting Server...' : 'Start Server'}
          </Button>
        </div>
      ) : (
        <div className="animate-fade-in">
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium mb-1">Server is running at:</p>
            <div className="flex items-center gap-2">
              <code className="bg-background px-3 py-1 rounded border text-sm flex-grow">
                {serverUrl}
              </code>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => {
                  navigator.clipboard.writeText(serverUrl);
                  toast.success('Server URL copied to clipboard');
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Your server is ready. You can now upload and manage files.
          </p>
          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              className="gap-1 transition-smooth"
              onClick={() => {
                window.scrollTo({
                  top: document.getElementById('file-manager')?.offsetTop || 0,
                  behavior: 'smooth'
                });
              }}
            >
              Go to File Manager
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerConfig;

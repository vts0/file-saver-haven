
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

// This would normally be a server-side Node.js function
// For the purposes of this demo, we're simulating it
export const launchGoServer = (port) => {
  return new Promise((resolve, reject) => {
    try {
      // Path to the Go executable (would be different in production)
      const goPath = path.resolve(process.cwd(), 'public/go');
      const command = `cd ${goPath} && go run main.go -port ${port}`;
      
      // Execute the command
      const proc = exec(command);
      
      // Log output for debugging
      proc.stdout.on('data', (data) => {
        console.log(`Go server stdout: ${data}`);
      });
      
      proc.stderr.on('data', (data) => {
        console.error(`Go server stderr: ${data}`);
      });
      
      // Check if server started successfully
      proc.on('error', (error) => {
        reject(error);
      });
      
      // Give the server some time to start up
      setTimeout(() => {
        resolve({ port });
      }, 1000);
    } catch (error) {
      reject(error);
    }
  });
};

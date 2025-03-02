
# File Storage Server

This is a monolithic Go server that handles both the API and serves the frontend static files for the File Storage Haven application.

## How to use

1. Build the Go application:
   ```bash
   go build -o file-storage-server main.go
   ```

2. Run the server:
   ```bash
   ./file-storage-server --port 8080
   ```

   Or let the application specify the port:
   ```bash
   ./file-storage-server
   ```

## Features

- Serves the React frontend from the `/dist` directory
- Provides API endpoints for file operations
- Creates a `files` directory to store uploaded files
- Handles CORS for API requests

## API Endpoints

- `GET /api/status` - Check server status
- `POST /api/upload` - Upload a file
- `GET /api/files` - List all files
- `GET /api/files/:filename` - Download a specific file
- `DELETE /api/files/:filename` - Delete a specific file

## For Tauri Integration

When building the Tauri app:

1. Build this Go server as a binary
2. Include it as a sidecar in your Tauri configuration
3. The React frontend will communicate with the server through localhost


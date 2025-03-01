
# Go File Server

This is a simple Go file server that allows you to upload and manage files. The server creates a `files` directory where all uploaded files are stored.

## How to use

1. Build the Go application:
   ```
   go build -o fileserver main.go
   ```

2. Run the server:
   ```
   ./fileserver
   ```

3. The server will prompt you to enter a port number.

4. After specifying the port, the server will start and show the URL where it's accessible.

## API Endpoints

- `POST /api/upload` - Upload a file
- `GET /api/files` - List all files
- `GET /api/files/:filename` - Download a specific file
- `DELETE /api/files/:filename` - Delete a specific file

## Note

This server implementation is meant to be a companion to the frontend React application. The server handles file storage, retrieval, and management while the React frontend provides a user-friendly interface.

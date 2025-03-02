
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

type FileInfo struct {
	Name       string `json:"name"`
	Size       int64  `json:"size"`
	UploadDate string `json:"uploadDate"`
}

func main() {
	var port int
	flag.IntVar(&port, "port", 8080, "Port to run the server on")
	flag.Parse()

	// Ensure the files directory exists
	if err := os.MkdirAll("files", os.ModePerm); err != nil {
		log.Fatalf("Failed to create files directory: %v", err)
	}

	// Set up CORS middleware
	corsMiddleware := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			
			next.ServeHTTP(w, r)
		})
	}

	// Create a new router
	mux := http.NewServeMux()

	// API Routes
	
	// Upload file endpoint
	mux.HandleFunc("/api/upload", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Parse the multipart form
		err := r.ParseMultipartForm(32 << 20) // max 32MB
		if err != nil {
			http.Error(w, "Failed to parse form", http.StatusBadRequest)
			return
		}

		// Get the file from the form
		file, handler, err := r.FormFile("file")
		if err != nil {
			http.Error(w, "Error retrieving file", http.StatusBadRequest)
			return
		}
		defer file.Close()

		// Create the file path
		filePath := filepath.Join("files", handler.Filename)

		// Create a new file in the files directory
		dst, err := os.Create(filePath)
		if err != nil {
			http.Error(w, "Failed to create file", http.StatusInternalServerError)
			return
		}
		defer dst.Close()

		// Copy the file
		if _, err := io.Copy(dst, file); err != nil {
			http.Error(w, "Failed to save file", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, "File uploaded successfully: %s", handler.Filename)
	})

	// List files endpoint
	mux.HandleFunc("/api/files", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "GET" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		files, err := os.ReadDir("files")
		if err != nil {
			http.Error(w, "Failed to read files directory", http.StatusInternalServerError)
			return
		}

		var fileInfos []FileInfo

		for _, file := range files {
			if file.IsDir() {
				continue
			}

			info, err := file.Info()
			if err != nil {
				continue
			}

			fileInfos = append(fileInfos, FileInfo{
				Name:       info.Name(),
				Size:       info.Size(),
				UploadDate: info.ModTime().Format(time.RFC3339),
			})
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(fileInfos); err != nil {
			http.Error(w, "Failed to encode file list", http.StatusInternalServerError)
			return
		}
	})

	// File operations endpoint (download/delete)
	mux.HandleFunc("/api/files/", func(w http.ResponseWriter, r *http.Request) {
		fileName := r.URL.Path[len("/api/files/"):]
		if fileName == "" {
			http.Error(w, "Filename not provided", http.StatusBadRequest)
			return
		}

		// Ensure the file path is within the files directory
		filePath := filepath.Join("files", filepath.Clean(fileName))
		if !filepath.IsAbs(filePath) {
			filePath = filepath.Join(".", filePath)
		}

		if r.Method == "GET" {
			// Check if the file exists
			if _, err := os.Stat(filePath); os.IsNotExist(err) {
				http.Error(w, "File not found", http.StatusNotFound)
				return
			}

			// Serve the file
			http.ServeFile(w, r, filePath)
			return
		} else if r.Method == "DELETE" {
			// Check if the file exists
			if _, err := os.Stat(filePath); os.IsNotExist(err) {
				http.Error(w, "File not found", http.StatusNotFound)
				return
			}

			// Delete the file
			if err := os.Remove(filePath); err != nil {
				http.Error(w, "Failed to delete file", http.StatusInternalServerError)
				return
			}

			w.WriteHeader(http.StatusOK)
			fmt.Fprintf(w, "File deleted successfully: %s", fileName)
			return
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
	})

	// Status endpoint for health check
	mux.HandleFunc("/api/status", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status": "running",
			"time":   time.Now().Format(time.RFC3339),
		})
	})

	// Static file server for the frontend build files
	// This will serve the frontend as a single page application
	// For Tauri app, we'll serve it from the dist directory
	fs := http.FileServer(http.Dir("../dist"))
	mux.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// If path doesn't exist and is not an API route, serve index.html
		path := r.URL.Path
		if path != "/" && !fileExists("../dist"+path) && !isAPIRoute(path) {
			r.URL.Path = "/"
		}
		fs.ServeHTTP(w, r)
	}))

	// Create the server with CORS middleware
	server := &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: corsMiddleware(mux),
	}

	// Start the server
	serverAddr := fmt.Sprintf("http://localhost:%d", port)
	log.Printf("Server running at: %s\n", serverAddr)
	
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}

// Helper function to check if a file exists
func fileExists(filename string) bool {
	_, err := os.Stat(filename)
	return !os.IsNotExist(err)
}

// Helper function to check if a path is an API route
func isAPIRoute(path string) bool {
	return len(path) >= 4 && path[:4] == "/api"
}

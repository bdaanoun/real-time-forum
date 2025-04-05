package posts

import (
	"encoding/json"
	"net/http"
	"time"

	dataBase "forum/handlers/dataBase"
)

// DB is your database connection (set this somewhere in your main package)

type PostRequest struct {
	Title   string `json:"title"`
	Content string `json:"content"`
	UserID  int    `json:"user_id"`
}

func SetPost(w http.ResponseWriter, r *http.Request) {
	var db = dataBase.ForumDB

	// Ensure it's a POST request
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Decode JSON request
	var req PostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Basic validation
	if req.Title == "" || req.Content == "" || req.UserID == 0 {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// Insert post into DB
	query := `INSERT INTO posts (title, content, user_id, created_at) VALUES (?, ?, ?, ?)`
	_, err := db.Exec(query, req.Title, req.Content, req.UserID, time.Now())
	if err != nil {
		http.Error(w, "Failed to create post", http.StatusInternalServerError)
		return
	}

	// Respond with success
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"message": "Post created successfully"}`))
}

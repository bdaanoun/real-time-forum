package posts

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	dataBase "forum/handlers/dataBase"
)

type PostRequest struct {
	Title      string `json:"title"`
	Content    string `json:"content"`
	UserID     int    `json:"user_id"`
	Categories []int  `json:"categories"`
}

func SetPostHandler(w http.ResponseWriter, r *http.Request) {
	db := dataBase.ForumDB

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
	fmt.Println("cat**********", req.Categories)

	// Basic validation
	if req.Title == "" || req.Content == "" || req.UserID == 0 {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// Insert post into DB
	query := `INSERT INTO posts (title, content, user_id, created_at) VALUES (?, ?, ?, ?)`
	result, err := db.Exec(query, req.Title, req.Content, req.UserID, time.Now())
	if err != nil {
		http.Error(w, "Failed to create post", http.StatusInternalServerError)
		return
	}

	postID, err := result.LastInsertId()
	if err != nil {
		http.Error(w, "Failed to retrieve post ID", http.StatusInternalServerError)
		return
	}
	for _, categoryID := range req.Categories {
		_, err := db.Exec(`INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)`, postID, categoryID+1)
		if err != nil {
			http.Error(w, "failed to inset categories", http.StatusInternalServerError)
		}

	}

	// Respond with success
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"message": "Post created successfully"}`))
}

package comment

import (
	"encoding/json"
	database "forum/handlers/dataBase"
	"net/http"
	"time"
)

type CommentRequest struct {
	PostID  int    `json:"post_id"`
	Content string `json:"content"`
}

func SetComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CommentRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil || req.PostID == 0 || req.Content == "" {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	ValidateSession
	userID, err := ValidateSession(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	_, err = database.ForumDB.Exec(`
        INSERT INTO comments (post_id, user_id, content, created_at) 
        VALUES (?, ?, ?, ?)`,
		req.PostID, userID, req.Content, time.Now(),
	)
	if err != nil {
		http.Error(w, "Failed to add comment", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Comment added successfully"))
}

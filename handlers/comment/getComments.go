package comment

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	dataB "forum/handlers/dataBase"
)

type Comment struct {
	Content   string `json:"content"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	CreatedAt string `json:"created_at"`
}

func GetCommentsHandler(w http.ResponseWriter, r *http.Request) {
	postIDStr := r.URL.Query().Get("post_id")
	if postIDStr == "" {
		http.Error(w, "Missing post_id query parameter", http.StatusBadRequest)
		return
	}

	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		http.Error(w, "Invalid post_id", http.StatusBadRequest)
		return
	}
	commentRows, err := dataB.ForumDB.Query(`
		SELECT c.content, u.first_name, u.last_name, c.created_at
		FROM comments c
		JOIN users u ON c.user_id = u.id
		WHERE c.post_id = ?
		ORDER BY c.created_at ASC`, postID)
	if err != nil {
		log.Println("Error fetching comments:", err)
		http.Error(w, "Failed to fetch comments", http.StatusInternalServerError)
		return
	}
	defer commentRows.Close()
	var comments []Comment
	// var comments []map[string]interface{}
	for commentRows.Next() {
		var commentContent, commentFirstName, commentLastName string
		var createdAt string
		err := commentRows.Scan(&commentContent, &commentFirstName, &commentLastName, &createdAt)
		if err != nil {
			log.Println("Error scanning comment:", err)
			continue
		}
		comment := Comment{
			Content:   commentContent,
			FirstName: commentFirstName,
			LastName:  commentLastName,
			CreatedAt: createdAt,
		}
		comments = append(comments, comment)
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(comments); err != nil {
		http.Error(w, "Failed to encode comments to JSON", http.StatusInternalServerError)
	}
}

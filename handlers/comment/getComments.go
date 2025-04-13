package comment

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"forum/handlers/auth"
	dataB "forum/handlers/dataBase"
)

type Comment struct {
	ID           int    `json:"id"`
	Content      string `json:"content"`
	FirstName    string `json:"first_name"`
	LastName     string `json:"last_name"`
	CreatedAt    string `json:"created_at"`
	LikeCount    int    `json:"like_count"`
	DislikeCount int    `json:"dislike_count"`
	UserReaction *int   `json:"user_reaction"`
}


func GetCommentsHandler(w http.ResponseWriter, r *http.Request) {
	postIDStr := r.URL.Query().Get("post_id")
	if postIDStr == "" {
		http.Error(w, "Missing post_id query parameter", http.StatusBadRequest)
		return
	}

	userID, err := auth.ValidateSession(r, dataB.ForumDB)
	if err != nil {
		http.Error(w, "Invalid session", http.StatusUnauthorized)
		return
	}

	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		http.Error(w, "Invalid post_id", http.StatusBadRequest)
		return
	}

	commentRows, err := dataB.ForumDB.Query(`
		SELECT 
			c.id,
			c.content, 
			u.first_name, 
			u.last_name, 
			c.created_at,
			(SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c.id AND reaction_type = 1),
			(SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c.id AND reaction_type = -1),
			(SELECT reaction_type FROM comment_reactions WHERE comment_id = c.id AND user_id = ?)
		FROM comments c
		JOIN users u ON c.user_id = u.id
		WHERE c.post_id = ?
		ORDER BY c.created_at DESC
	`, userID, postID)
	if err != nil {
		log.Println("Error fetching comments:", err)
		http.Error(w, "Failed to fetch comments", http.StatusInternalServerError)
		return
	}
	defer commentRows.Close()

	var comments []Comment

	for commentRows.Next() {
		var comment Comment
		err := commentRows.Scan(
			&comment.ID,
			&comment.Content,
			&comment.FirstName,
			&comment.LastName,
			&comment.CreatedAt,
			&comment.LikeCount,
			&comment.DislikeCount,
			&comment.UserReaction,
		)
		if err != nil {
			log.Println("Error scanning comment:", err)
			continue
		}
		comments = append(comments, comment)
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(comments); err != nil {
		http.Error(w, "Failed to encode comments to JSON", http.StatusInternalServerError)
	}
}

package posts

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	auth "forum/handlers/auth"
	dataB "forum/handlers/dataBase"
)

func GetPostHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("ingetpost")
	postIDStr := r.URL.Query().Get("id")
	if postIDStr == "" {
		http.Error(w, "Post ID is required", http.StatusBadRequest)
		return
	}

	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		http.Error(w, "Invalid Post ID", http.StatusBadRequest)
		return
	}

	userID, err := auth.ValidateSession(r, dataB.ForumDB)
	if err != nil {
		http.Error(w, "Invalid session", http.StatusUnauthorized)
		return
	}

	var title, content, category, firstName, lastName string
	var likeCount, dislikeCount, userReaction sql.NullInt32
	var createdAt time.Time // Added createdAt variable

	row := dataB.ForumDB.QueryRow(`
                SELECT
                        p.title,
                        p.content, 
                        COALESCE(GROUP_CONCAT(c.name), '') AS categories,
                        u.first_name,
                        u.last_name, 
                        (SELECT COUNT(*) FROM post_reactions WHERE post_id = p.id AND reaction_type = 1) AS like_count,
                        (SELECT COUNT(*) FROM post_reactions WHERE post_id = p.id AND reaction_type = -1) AS dislike_count,
                        (SELECT reaction_type FROM post_reactions WHERE post_id = p.id AND user_id = ?) AS user_reaction,
                        p.created_at
                FROM posts p
                LEFT JOIN post_categories pc ON p.id = pc.post_id
                LEFT JOIN categories c ON pc.category_id = c.id
                JOIN users u ON p.user_id = u.id
                WHERE p.id = ?
                GROUP BY p.id`, userID, postID)

	err = row.Scan(&title, &content, &category, &firstName, &lastName, &likeCount, &dislikeCount, &userReaction, &createdAt) // Added createdAt to Scan
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Post not found", http.StatusNotFound)
			return
		} else {
			log.Println("Error fetching post:", err)
			http.Error(w, "Error fetching post", http.StatusInternalServerError)
		}
		return
	}

	post := map[string]interface{}{
		"id":            postID,
		"title":         title,
		"content":       content,
		"category":      category,
		"creator":       fmt.Sprintf("%s %s", firstName, lastName),
		"like_count":    likeCount.Int32,
		"dislike_count": dislikeCount.Int32,
		"user_reaction": userReaction.Int32,
		"created_at":    createdAt, // Added created_at to the response
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(post); err != nil {
		log.Println("Error encoding response:", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
	}
}

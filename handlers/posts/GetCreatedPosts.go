package posts

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	auth "forum/handlers/auth"
	dataB "forum/handlers/dataBase"
)
 
func GetCreatedPostsHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := auth.ValidateSession(r, dataB.ForumDB)
	if err != nil {
		http.Error(w, "Invalid session", http.StatusUnauthorized)
		return
	}

	rows, err := dataB.ForumDB.Query(`
                SELECT
                        p.id,
                        p.title,
                        p.content,
                        u.first_name,
                        u.last_name,
                        (SELECT COUNT(*) FROM post_reactions WHERE post_id = p.id AND reaction_type = 1) AS like_count,
                        (SELECT COUNT(*) FROM post_reactions WHERE post_id = p.id AND reaction_type = -1) AS dislike_count,
                        (SELECT reaction_type FROM post_reactions WHERE post_id = p.id AND user_id = ?) AS user_reaction,
                        p.created_at
                FROM posts p
                JOIN users u ON p.user_id = u.id
                WHERE p.user_id = ?
                ORDER BY p.created_at DESC`, userID, userID)
	if err != nil {
		log.Println("Error fetching created posts:", err)
		http.Error(w, "Error fetching created posts", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	posts := []map[string]interface{}{}

	for rows.Next() {
		var postID int
		var title, content, firstName, lastName string
		var likeCount, dislikeCount, userReaction sql.NullInt32
		var createdAt time.Time

		err := rows.Scan(&postID, &title, &content, &firstName, &lastName, &likeCount, &dislikeCount, &userReaction, &createdAt)
		if err != nil {
			log.Println("Error scanning row:", err)
			continue
		}

		post := map[string]interface{}{
			"id":            postID,
			"title":         title,
			"content":       content,
			"creator":       fmt.Sprintf("%s %s", firstName, lastName),
			"like_count":    likeCount.Int32,
			"dislike_count": dislikeCount.Int32,
			"user_reaction": userReaction.Int32,
			"created_at":    createdAt,
		}

		posts = append(posts, post)
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(posts); err != nil {
		log.Println("Error encoding response:", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
	}
}

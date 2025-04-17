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

func GetLikedPostsHandler(w http.ResponseWriter, r *http.Request) {
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
        1 AS user_reaction,
        p.created_at,
        GROUP_CONCAT(c.name) AS categories
    FROM posts p
    JOIN users u ON p.user_id = u.id
    JOIN post_reactions pr ON p.id = pr.post_id
    LEFT JOIN post_categories pc ON p.id = pc.post_id
    LEFT JOIN categories c ON pc.category_id = c.id
    WHERE pr.user_id = ? AND pr.reaction_type = 1
    GROUP BY p.id
    ORDER BY p.created_at DESC
`, userID)
	if err != nil {
		log.Println("Error fetching liked posts:", err)
		http.Error(w, "Error fetching liked posts", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	posts := []map[string]interface{}{}

	for rows.Next() {
		var postID int
		var title, content, firstName, lastName string
		var likeCount, dislikeCount sql.NullInt32
		var createdAt time.Time
		var userReaction int // Add this line
                var category string
		err := rows.Scan(&postID, &title, &content, &firstName, &lastName, &likeCount, &dislikeCount, &userReaction, &createdAt ,  &category) // Corrected this line
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
			"user_reaction": userReaction, // Corrected this line
			"created_at":    createdAt,
                        "category" : category,
		}

		posts = append(posts, post)
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(posts); err != nil {
		log.Println("Error encoding response:", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
	}
}

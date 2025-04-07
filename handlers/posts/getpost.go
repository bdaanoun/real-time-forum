package posts

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	auth "forum/handlers/auth"
	dataB "forum/handlers/dataBase"
)

func GetPostsHandler(w http.ResponseWriter, r *http.Request) {
	offset := r.URL.Query().Get("offset")
	if offset == "" {
		offset = "0"
	}

	offsetInt, err := strconv.Atoi(offset)
	if err != nil {
		http.Error(w, "Invalid offset", http.StatusBadRequest)
		return
	}

	userID, err := auth.ValidateSession(r, dataB.ForumDB)
	if err != nil {
		userID = 0
	}

	rows, err := dataB.ForumDB.Query(`
		SELECT p.id, p.title, p.content, 
			GROUP_CONCAT(c.name) AS categories, 
			u.first_name, u.last_name, 
			(SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND reaction_type = 1) AS like_count,
			(SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND reaction_type = -1) AS dislike_count,
			(SELECT reaction_type FROM post_likes WHERE post_id = p.id AND user_id = ?) AS user_reaction
		FROM posts p
		JOIN post_categories pc ON p.id = pc.post_id
		JOIN categories c ON pc.category_id = c.id
		JOIN users u ON p.user_id = u.id
		GROUP BY p.id
		ORDER BY p.created_at DESC
		LIMIT 10 OFFSET ?`, userID, offsetInt)
	if err != nil {
		log.Println("Error fetching posts:", err)
		http.Error(w, "Error fetching posts", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var posts []map[string]interface{}

	for rows.Next() {
		var postID int
		var title, content, category, firstName, lastName string
		var likeCount, dislikeCount, userReaction sql.NullInt32

		err := rows.Scan(&postID, &title, &content, &category, &firstName, &lastName, &likeCount, &dislikeCount, &userReaction)
		if err != nil {
			log.Println("Error scanning row:", err)
			continue
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
		}

		posts = append(posts, post)
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(posts); err != nil {
		log.Println("Error encoding response:", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
	}
}
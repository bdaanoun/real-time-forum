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

func GetPosts(w http.ResponseWriter, r *http.Request) {
	// Get offset from the query parameters
	offset := r.URL.Query().Get("offset")
	if offset == "" {
		offset = "0"
	}

	// Convert offset to integer
	offsetInt, err := strconv.Atoi(offset)
	if err != nil {
		http.Error(w, "Invalid offset", http.StatusBadRequest)
		return
	}
	userID, err := auth.ValidateSession( r , dataB.ForumDB,)
	if err != nil {
		// If user is not logged in, don't show personalized like/dislike info
		userID = 0 // No user logged in
	}
	// Fetch posts with the corresponding data
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

	// Iterate over the rows and fetch the necessary data
	for rows.Next() {
		var postID int
		var title, content, category, firstName, lastName string
		var likeCount, dislikeCount, userReaction sql.NullInt32 // handle null values for user reaction

		err := rows.Scan(&postID, &title, &content, &category, &firstName, &lastName, &likeCount, &dislikeCount, &userReaction)
		if err != nil {
			log.Println("Error scanning row:", err)
			continue
		}

		// Fetch comments for the post
		commentRows, err := dataB.ForumDB.Query(`
			SELECT c.content, u.first_name, u.last_name, c.created_at
			FROM comments c
			JOIN users u ON c.user_id = u.id
			WHERE c.post_id = ?
			ORDER BY c.created_at ASC`, postID)
		if err != nil {
			log.Println("Error fetching comments:", err)
			continue
		}
		defer commentRows.Close()

		var comments []map[string]interface{}
		for commentRows.Next() {
			var commentContent, commentFirstName, commentLastName string
			var createdAt string

			err := commentRows.Scan(&commentContent, &commentFirstName, &commentLastName, &createdAt)
			if err != nil {
				log.Println("Error scanning comment:", err)
				continue
			}

			comments = append(comments, map[string]interface{}{
				"content":    commentContent,
				"first_name": commentFirstName,
				"last_name":  commentLastName,
				"created_at": createdAt,
			})
		}

		// Build the post object
		post := map[string]interface{}{
			"id":            postID,
			"title":         title,
			"content":       content,
			"category":      category,
			"creator":       fmt.Sprintf("%s %s", firstName, lastName),
			"like_count":    likeCount.Int32,
			"dislike_count": dislikeCount.Int32,
			"user_reaction": userReaction.Int32,
			"comments":      comments,
		}

		// Append post to the result
		posts = append(posts, post)
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(posts); err != nil {
		log.Println("Error encoding response:", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
	}
}

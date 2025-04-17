package posts

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	auth "forum/handlers/auth"
	dataB "forum/handlers/dataBase"
)

func GetPostsHandler(w http.ResponseWriter, r *http.Request) {
	// Handle pagination offset
	offset := r.URL.Query().Get("offset")
	if offset == "" {
		offset = "0"
	}
	offsetInt, err := strconv.Atoi(offset)
	if err != nil {
		http.Error(w, "Invalid offset", http.StatusBadRequest)
		return
	}

	// Validate user session
	userID, err := auth.ValidateSession(r, dataB.ForumDB)
	if err != nil {
		userID = 0 // treat as guest user
	}

	// Get all category filters from the query: ?categories=Art&categories=Sportif
	categories := r.URL.Query()["categories"]

	// Build the SQL query dynamically
	baseQuery := `
		SELECT
			p.id,
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
	`
	args := []interface{}{userID}

	// Add WHERE clause if categories are provided
	if len(categories) > 0 {
		baseQuery += " WHERE c.name IN (" + placeholders(len(categories)) + ")"
		for _, cat := range categories {
			args = append(args, cat)
		}
	}

	// Final part of the query
	baseQuery += `
		GROUP BY p.id
		ORDER BY p.created_at DESC
		LIMIT 10 OFFSET ?
	`
	args = append(args, offsetInt)

	// Execute the query
	rows, err := dataB.ForumDB.Query(baseQuery, args...)
	if err != nil {
		log.Println("Error fetching posts:", err)
		http.Error(w, "Error fetching posts", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Process the result
	posts := []map[string]interface{}{}
	for rows.Next() {
		var postID int
		var title, content, category, firstName, lastName string
		var likeCount, dislikeCount, userReaction sql.NullInt32
		var createdAt time.Time

		err := rows.Scan(&postID, &title, &content, &category, &firstName, &lastName, &likeCount, &dislikeCount, &userReaction, &createdAt)
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
			"created_at":    createdAt,
		}

		posts = append(posts, post)
	}

	// Send JSON response
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(posts); err != nil {
		log.Println("Error encoding response:", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
	}
}

// Helper to create placeholders like "?,?,?,?"
func placeholders(n int) string {
	return strings.TrimRight(strings.Repeat("?,", n), ",")
}

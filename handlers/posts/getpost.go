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
                return
        }
        fmt.Println("go", offset)
        rows, err := dataB.ForumDB.Query(`
                SELECT
                        p.id,
                        p.title,
                        p.content, 
                        COALESCE (GROUP_CONCAT(c.name), '') AS categories, 
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
                GROUP BY p.id
                ORDER BY p.created_at DESC
                LIMIT 10 OFFSET ?`, userID, offsetInt)

        if err != nil {
                log.Println("Error fetching posts:", err)
                http.Error(w, "Error etching posts", http.StatusInternalServerError)
                return
        }
        defer rows.Close()

        posts := []map[string]interface{}{}

        for rows.Next() {
                var postID int
                var title, content, category, firstName, lastName string
                var likeCount, dislikeCount, userReaction sql.NullInt32
                var createdAt time.Time // Add created_at variable

                err := rows.Scan(&postID, &title, &content, &category, &firstName, &lastName, &likeCount, &dislikeCount, &userReaction, &createdAt) // Add created_at to scan
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
                        "created_at":    createdAt, // Add created_at to the post map
                }

                posts = append(posts, post)
        }

        w.Header().Set("Content-Type", "application/json")
        if err := json.NewEncoder(w).Encode(posts); err != nil {
                log.Println("Error encoding response:", err)
                http.Error(w, "Error encoding response", http.StatusInternalServerError)
        }
}
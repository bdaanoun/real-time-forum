package posts

import (
        "encoding/json"
        "net/http"
        "time"

        dataBase "forum/handlers/dataBase"
)

type PostRequest struct {
        Title      string `json:"title"`
        Content    string `json:"content"`
        UserID     int    `json:"user_id"`
        Categories []int  `json:"categories"`
}

type PostResponse struct {
        Category      string    `json:"category"`
        Content       string    `json:"content"`
        CreatedAt     time.Time `json:"created_at"`
        Creator       string    `json:"creator"`
        DislikeCount  int       `json:"dislike_count"`
        ID            int64     `json:"id"`
        LikeCount     int       `json:"like_count"`
        Title         string    `json:"title"`
        UserReaction  int       `json:"user_reaction"`
}

func SetPostHandler(w http.ResponseWriter, r *http.Request) {
        db := dataBase.ForumDB

        if r.Method != http.MethodPost {
                http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
                return
        }

        var req PostRequest
        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
                http.Error(w, "Invalid request body", http.StatusBadRequest)
                return
        }

        if req.Title == "" || req.Content == "" || req.UserID == 0 {
                http.Error(w, "Missing required fields", http.StatusBadRequest)
                return
        }

        query := `INSERT INTO posts (title, content, user_id, created_at) VALUES (?, ?, ?, ?)`
        result, err := db.Exec(query, req.Title, req.Content, req.UserID, time.Now())
        if err != nil {
                http.Error(w, "Failed to create post", http.StatusInternalServerError)
                return
        }

        postID, err := result.LastInsertId()
        if err != nil {
                http.Error(w, "Failed to retrieve post ID", http.StatusInternalServerError)
                return
        }

        var categoryName string
        if len(req.Categories) > 0 {
                err = db.QueryRow(`SELECT name FROM categories WHERE id = ?`, req.Categories[0]+1).Scan(&categoryName)

                if err != nil {
                        categoryName = ""
                }

                for _, categoryID := range req.Categories {
                        _, err := db.Exec(`INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)`, postID, categoryID+1)
                        if err != nil {
                                http.Error(w, "failed to inset categories", http.StatusInternalServerError)
                                return
                        }
                }
        }

        var creatorName string
        err = db.QueryRow(`SELECT first_name || ' ' || last_name FROM users WHERE id = ?`, req.UserID).Scan(&creatorName)
        if err != nil {
                creatorName = ""
        }

        var createdAt time.Time
        err = db.QueryRow(`SELECT created_at FROM posts WHERE id = ?`, postID).Scan(&createdAt)
        if err != nil {
                createdAt = time.Now()
        }

        response := PostResponse{
                Category:      categoryName,
                Content:       req.Content,
                CreatedAt:     createdAt,
                Creator:       creatorName,
                DislikeCount:  0,
                ID:            postID,
                LikeCount:     0,
                Title:         req.Title,
                UserReaction:  0,
        }

        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusCreated)
        json.NewEncoder(w).Encode(response)
}
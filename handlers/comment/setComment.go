package comment

import (
        "encoding/json"
        database "forum/handlers/dataBase"
        "net/http"
        "time"
        auth "forum/handlers/auth"
)

type CommentResponse struct {
        Username  string    `json:"username"`
        CreatedAt time.Time `json:"created_at"`
        Content   string    `json:"content"`
}

type CommentRequest struct {
        PostID  int    `json:"post_id"`
        Content string `json:"content"`
}

func SetCommentHandler(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
                http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
                return
        }

        var req CommentRequest
        err := json.NewDecoder(r.Body).Decode(&req)
        if err != nil || req.PostID == 0 || req.Content == "" {
                http.Error(w, "Invalid request body", http.StatusBadRequest)
                return
        }

        userID, err := auth.ValidateSession(r, database.ForumDB)
        if err != nil {
                http.Error(w, "Unauthorized", http.StatusUnauthorized)
                return
        }

        result, err := database.ForumDB.Exec(`
                INSERT INTO comments (post_id, user_id, content, created_at) 
                VALUES (?, ?, ?, ?)`,
                req.PostID, userID, req.Content, time.Now(),
        )
        if err != nil {
                http.Error(w, "Failed to add comment", http.StatusInternalServerError)
                return
        }

        lastID, err := result.LastInsertId()
        if err != nil {
                http.Error(w, "Failed to get last inserted ID", http.StatusInternalServerError)
                return
        }

        row := database.ForumDB.QueryRow(`
                SELECT users.nickname, comments.created_at, comments.content
                FROM comments
                JOIN users ON comments.user_id = users.id
                WHERE comments.id = ?`, lastID)

        var commentResponse CommentResponse
        err = row.Scan(&commentResponse.Username, &commentResponse.CreatedAt, &commentResponse.Content)
        if err != nil {
                http.Error(w, "Failed to retrieve created comment", http.StatusInternalServerError)
                return
        }

        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusCreated)
        json.NewEncoder(w).Encode(commentResponse)
}
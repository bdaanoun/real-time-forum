package chat

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"forum/handlers/auth"
	database "forum/handlers/dataBase"
)

type UserStatus struct {
	ID                 int        `json:"id"`
	Nickname           string     `json:"nickname"`
	IsOnline           bool       `json:"is_online"`
	LastMessageContent *string    `json:"last_message_content"`
	LastMessageSentAt  *time.Time `json:"last_message_sent_at"`
}

func GetUsersListHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := auth.ValidateSession(r, database.ForumDB)
	if err != nil {
		http.Error(w, "Invalid session", http.StatusUnauthorized)
		return
	}

	query := `
	SELECT
		u.id,
		u.nickname,
		(
			SELECT m.content
			FROM messages m
			WHERE 
				(m.sender_id = ? AND m.receiver_id = u.id)
				OR (m.sender_id = u.id AND m.receiver_id = ?)
			ORDER BY m.sent_at DESC
			LIMIT 1
		) AS last_message_content,
		(
			SELECT m.sent_at
			FROM messages m
			WHERE 
				(m.sender_id = ? AND m.receiver_id = u.id)
				OR (m.sender_id = u.id AND m.receiver_id = ?)
			ORDER BY m.sent_at DESC
			LIMIT 1
		) AS last_message_sent_at
	FROM users u
	WHERE u.id <> ?;
`
	rows, err := database.ForumDB.Query(query, userID, userID, userID, userID, userID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var userList []UserStatus

	mutex.Lock()
	defer mutex.Unlock()

	for rows.Next() {
		var id int
		var nickname string
		var lastMessageContent sql.NullString
		var lastMessageSentAt sql.NullTime
	
		err := rows.Scan(&id, &nickname, &lastMessageContent, &lastMessageSentAt)
		if err != nil {
			continue
		}
	
		connections, ok := clients[nickname]
		isOnline := ok && len(connections) > 0
	
		var messageContentPtr *string
		if lastMessageContent.Valid {
			messageContentPtr = &lastMessageContent.String
		}
	
		var messageSentAtPtr *time.Time
		if lastMessageSentAt.Valid {
			messageSentAtPtr = &lastMessageSentAt.Time
		}
	
		userList = append(userList, UserStatus{
			ID:                 id,
			Nickname:           nickname,
			IsOnline:           isOnline,
			LastMessageContent: messageContentPtr,
			LastMessageSentAt:  messageSentAtPtr,
		})
	}	

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userList)
}

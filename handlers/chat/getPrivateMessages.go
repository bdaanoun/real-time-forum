package chat

import (
	"encoding/json"
	"net/http"
	"sort"
	"strconv"
	"time"

	"forum/handlers/auth"
	database "forum/handlers/dataBase"
)

type Message2 struct {
	Content          string    `json:"content"`
	SentAt           time.Time `json:"sent_at"`
	SenderNickname   string    `json:"sender_nickname"`
	ReceiverNickname string    `json:"receiver_nickname"`
}

func GetMessagesHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := auth.ValidateSession(r, database.ForumDB)
	if err != nil {
		http.Error(w, "Invalid session", http.StatusUnauthorized)
		return
	}

	nickname, err := getUserName(userID)
	if err != nil {
		http.Error(w, "Unable to extract nickname from session", http.StatusInternalServerError)
		return
	}

	otherNickname := r.URL.Query().Get("otherser")
	if nickname == "" || otherNickname == "" {
		http.Error(w, "Missing nickname or otherser parameter", http.StatusBadRequest)
		return
	}
	offsetParam := r.URL.Query().Get("offset")
	offset := 0
	if offsetParam != "" {
		parsedOffset, err := strconv.Atoi(offsetParam)
		if err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}

	query := `
		SELECT 
			m.content, 
			m.sent_at,
			sender.nickname ,
			receiver.nickname
		FROM messages m
		JOIN users sender ON sender.id = m.sender_id
		JOIN users receiver ON receiver.id = m.receiver_id
		WHERE 
			(sender.nickname = ? AND receiver.nickname = ?)
			OR (sender.nickname = ? AND receiver.nickname = ?)
		ORDER BY m.sent_at DESC
		LIMIT 10 OFFSET ?;
	`

	rows, err := database.ForumDB.Query(query, nickname, otherNickname, otherNickname, nickname, offset)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var messages []Message2
	for rows.Next() {
		var msg Message2
		if err := rows.Scan(&msg.Content, &msg.SentAt, &msg.SenderNickname, &msg.ReceiverNickname); err != nil {
			continue
		}
		messages = append(messages, msg)
	}

	sort.Slice(messages, func(i, j int) bool {
		return messages[i].SentAt.Before(messages[j].SentAt)
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

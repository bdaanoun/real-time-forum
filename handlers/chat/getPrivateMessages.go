package chat

import (
	"encoding/json"
	"net/http"
	"sort"
	"time"

	database "forum/handlers/dataBase"
)

type Message2 struct {
	Content          string    `json:"content"`
	SentAt           time.Time `json:"sent_at"`
	SenderNickname   string    `json:"sender_nickname"`
	ReceiverNickname string    `json:"receiver_nickname"`
}

func GetMessagesHandler(w http.ResponseWriter, r *http.Request) {
	nickname := r.URL.Query().Get("nickname")
	otherNickname := r.URL.Query().Get("otherser")

	if nickname == "" || otherNickname == "" {
		http.Error(w, "Missing nickname or otherser parameter", http.StatusBadRequest)
		return
	}

	query := `
		SELECT 
			m.content, 
			m.sent_at,
			sender.nickname AS sender_nickname,
			receiver.nickname AS receiver_nickname
		FROM messages m
		JOIN users sender ON sender.id = m.sender_id
		JOIN users receiver ON receiver.id = m.receiver_id
		WHERE 
			(sender.nickname = ? AND receiver.nickname = ?)
			OR (sender.nickname = ? AND receiver.nickname = ?)
		ORDER BY m.sent_at DESC
		LIMIT 10;
	`

	rows, err := database.ForumDB.Query(query, nickname, otherNickname, otherNickname, nickname)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var messages []Message2

	for rows.Next() {
		var msg Message2
		err := rows.Scan(&msg.Content, &msg.SentAt, &msg.SenderNickname, &msg.ReceiverNickname)
		if err != nil {
			continue
		}
		messages = append(messages, msg)
	}

	// Optional: Sort from oldest to newest
	sort.Slice(messages, func(i, j int) bool {
		return messages[i].SentAt.Before(messages[j].SentAt)
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

package chat

import (
	"encoding/json"
	"net/http"

	"forum/handlers/auth"
	database "forum/handlers/dataBase"
)

type onlineUsers struct {
	ID       int    `json:"id"`
	Nickname string `json:"nickname"`
	IsOnline bool   `json:"is_online"`
}

func GetOnlineUsersHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := auth.ValidateSession(r, database.ForumDB)
	if err != nil {
		http.Error(w, "Invalid session", http.StatusUnauthorized)
		return
	}
	username, err := getUserName(userID)
	if err != nil {
		http.Error(w, "unable to extract nickname from session", http.StatusInternalServerError)
		return
	}
	mutex.Lock()
	defer mutex.Unlock()
	var online []onlineUsers
	for nickname := range clients {
		if nickname == username {
			continue
		}
		var id int
		err := database.ForumDB.QueryRow("SELECT id FROM users WHERE nickname = ?", nickname).Scan(&id)
		if err != nil {
			continue
		}

		user := onlineUsers{
			ID:       id,
			Nickname: nickname,
			IsOnline: true,
		}
		online = append(online, user)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(online)
}

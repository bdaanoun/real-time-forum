package handlers

import (
	"encoding/json"
	"net/http"

	database "forum/handlers/dataBase"
)

type User struct {
	Nickname string `json:"nickname"`
	IsOnline bool   `json:"is_online"`
}

func GetUsersHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := database.ForumDB.Query("SELECT nickname, is_online FROM users")
	if err != nil {
		http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var user User
		if err := rows.Scan(&user.Nickname, &user.IsOnline); err != nil {
			http.Error(w, "Failed to scan user", http.StatusInternalServerError)
			return
		}
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, "Failed to iterate users", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

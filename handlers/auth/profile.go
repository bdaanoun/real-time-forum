package auth

import (
	"encoding/json"
	// "forum/handlers/auth"
	database "forum/handlers/dataBase"
	"net/http"
)

type UserProfile struct {
	Nickname  string
	Age       int
	FirstName string
	LastName  string
	Email     string
}

func ProfileHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := ValidateSession(r, database.ForumDB)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	var uu UserProfile
	errD := database.ForumDB.QueryRow(`SELECT nickname, email , age, first_name, last_name FROM users WHERE id = ?`,
		userID).Scan(&uu.Nickname, &uu.Email, &uu.Age, &uu.FirstName, &uu.LastName)
	if errD != nil {
		http.Error(w, "Error querying database", http.StatusInternalServerError)
		return

	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	jsonData, err := json.Marshal(uu)
	if err != nil {
		http.Error(w, "Error marshaling JSON", http.StatusInternalServerError)
		return
	}
	w.Write(jsonData)
}

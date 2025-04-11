package auth

import (
	"fmt"
	"log"
	"net/http"
	"time"

	dataBase "forum/handlers/dataBase"
)

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		if err == http.ErrNoCookie {
			http.Error(w, "No session found", http.StatusUnauthorized)
			return
		}
		http.Error(w, "Failed to read cookie", http.StatusInternalServerError)
		return
	}

	sessionID := cookie.Value

	_, err = dataBase.ForumDB.Exec("DELETE FROM sessions WHERE id = ?", sessionID)
	if err != nil {
		log.Println("Failed to delete session:", err)
		http.Error(w, "Failed to logout", http.StatusInternalServerError)
		return
	}

	// Remove the session cookie from the browser
	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    "",
		Expires:  time.Unix(0, 0), // Expire immediately
		HttpOnly: true,
		Secure:   true,
		Path:     "/",
	})

	fmt.Fprintln(w, "Logged out successfully")
}

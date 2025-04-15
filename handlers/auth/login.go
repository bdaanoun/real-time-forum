package auth

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	dataBase "forum/handlers/dataBase"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Nickname string `json:"nickname"`
	Password string `json:"password"`
}

func LogUser(w http.ResponseWriter, r *http.Request) {
	db := dataBase.ForumDB

	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	var loginRequest LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&loginRequest); err != nil {
		http.Error(w, "Invalid JSON data", http.StatusBadRequest)
		return
	}

	// Retrieve user from DB by Nickname
	var user User
	query := `SELECT id, nickname, age, gender, first_name, last_name, Nickname, password_hash FROM users WHERE Nickname = ?`
	row := db.QueryRow(query, loginRequest.Nickname)
	err := row.Scan(&user.ID, &user.Nickname, &user.Age, &user.Gender, &user.FirstName, &user.LastName, &user.Nickname, &user.Password)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusUnauthorized)
		} else {
			http.Error(w, "Error querying database", http.StatusInternalServerError)
		}
		return
	}
	fmt.Println("user", user)

	// Compare the provided password with the stored hash
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginRequest.Password))
	fmt.Println("hs", user.Password, loginRequest.Password)

	if err != nil {
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return
	}

	// Create session for the user
	sessionID, expiration, err := CreateSession(db, user.ID)
	if err != nil {
		http.Error(w, "Error creating session", http.StatusInternalServerError)
		return
	}

	// Set the session cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    sessionID,
		Expires:  expiration,
		HttpOnly: true, // Make it HTTP-only to prevent client-side access
		Secure:   false, // Ensure it is only sent over HTTPS
		Path:     "/",
	})

	// Respond to the client
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "Login successful")
}

// CreateSession generates a session ID, stores it in the database, and sets the cookie
func CreateSession(db *sql.DB, userID int) (string, time.Time, error) {
	// Generate a new session ID using UUID
	sessionID := uuid.New().String()

	// Set session expiration (2 hours from now)
	expiration := time.Now().Add(2 * time.Hour)

	// Store the session in the database
	query := `INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)`
	_, err := db.Exec(query, sessionID, userID, expiration)
	if err != nil {
		log.Println("Error storing session in database:", err)
		return "", time.Time{}, err
	}

	return sessionID, expiration, nil
}

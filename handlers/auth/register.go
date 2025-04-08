package auth

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	dataBase "forum/handlers/dataBase"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID        int    `json:"id"`
	Nickname  string `json:"nickname"`
	Age       string `json:"age"`
	Gender    string `json:"gender"`
	FirstName string `json:"firstname"`
	LastName  string `json:"lastname"`
	Email     string `json:"email"`
	Password  string `json:"password"`
}

func RegisterUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}
	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid JSON data", http.StatusBadRequest)
		return
	}
	if len(user.Password) < 4 {
		http.Error(w, "Password must be at least 4 characters long", http.StatusBadRequest)
		return
	}
	if err := checkUserExistence(user.Nickname, user.Email); err != nil {
		http.Error(w, err.Error(), http.StatusConflict)
		return
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}
	if err := insertUser(dataBase.ForumDB, user, string(hashedPassword)); err != nil {
		http.Error(w, "Error inserting user into database", http.StatusInternalServerError)
		return
	}
	err = dataBase.ForumDB.QueryRow("SELECT id FROM users WHERE email = ?", user.Email).Scan(&user.ID)
	if err != nil {
		http.Error(w, "Error retrieving user ID", http.StatusInternalServerError)
		return
	}
	sessionID, expiration, err := CreateSession(dataBase.ForumDB, user.ID)
	if err != nil {
		http.Error(w, "Error creating session", http.StatusInternalServerError)
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    sessionID,
		Expires:  expiration,
		HttpOnly: true,
		Secure:   true,
		Path:     "/",
	})
	w.WriteHeader(http.StatusCreated)
	fmt.Fprintln(w, "User registered successfully")
}

func checkUserExistence(nickname, email string) error {
	var existingNickname, existingEmail string
	err := dataBase.ForumDB.QueryRow("SELECT nickname FROM users WHERE nickname = ?", nickname).Scan(&existingNickname)
	if err == nil {
		return fmt.Errorf("nickname already exists")
	}
	err = dataBase.ForumDB.QueryRow("SELECT email FROM users WHERE email = ?", email).Scan(&existingEmail)
	if err == nil {
		return fmt.Errorf("email already exists")
	}
	return nil
}

func insertUser(db *sql.DB, user User, hashedPassword string) error {
	query := `
	INSERT INTO users (nickname, age, gender, first_name, last_name, email, password_hash)
	VALUES (?, ?, ?, ?, ?, ?, ?)
	`
	_, err := db.Exec(query,
		user.Nickname,
		user.Age,
		user.Gender,
		user.FirstName,
		user.LastName,
		user.Email,
		hashedPassword,
	)
	if err != nil {
		log.Println("Error inserting user into database:", err)
	}
	return err
}

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
	db := dataBase.ForumDB

	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid JSON data", http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}
	err = insertUser(db, user, string(hashedPassword))
	if err != nil {
		http.Error(w, "Error inserting user into database", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	fmt.Fprintln(w, "User registered successfully")
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


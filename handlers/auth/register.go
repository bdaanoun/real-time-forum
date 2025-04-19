package auth

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"

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
	if err := ValidateUser(user); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
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
		strings.ToLower(user.Nickname),
		user.Age,
		strings.ToLower(user.Gender),
		strings.ToLower(user.FirstName),
		strings.ToLower(user.LastName),
		strings.ToLower(user.Email),
		hashedPassword,
	)
	if err != nil {
		log.Println("Error inserting user into database:", err)
	}
	return err
}

func ValidateUser(user User) error {
	if strings.TrimSpace(user.Nickname) == "" ||
		strings.TrimSpace(user.Age) == "" ||
		strings.TrimSpace(user.Gender) == "" ||
		strings.TrimSpace(user.FirstName) == "" ||
		strings.TrimSpace(user.LastName) == "" ||
		strings.TrimSpace(user.Email) == "" ||
		strings.TrimSpace(user.Password) == "" {
		return errors.New("please fill in all fields")
	}

	age, err := strconv.Atoi(user.Age)
	if err != nil || age < 16 || age > 80 {
		return errors.New("the age should be between 16 and 80. GO AWAY")
	}

	if len(user.Nickname) > 15 {
		return errors.New("nickname should be less or equal to 15 characters")
	}

	nicknameRegex := regexp.MustCompile(`^[a-zA-Z_.]+$`)
	if !nicknameRegex.MatchString(user.Nickname) {
		return errors.New("nickname must not contain special characters OR numbers")
	}
	nameRegex := regexp.MustCompile(`^[a-zA-Z]+$`)
	if !nameRegex.MatchString(user.FirstName) {
		return errors.New("first name must contain only letters")
	}
	if !nameRegex.MatchString(user.LastName) {
		return errors.New("last name must contain only letters")
	}
	switch strings.ToLower(user.Gender) {
	case "male", "female":

	default:
		return errors.New("gender must be one of: male, female")
	}

	emailRegex := regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)
	if !emailRegex.MatchString(user.Email) {
		return errors.New("invalid email format")
	}

	if len(user.Password) < 6 {
		return errors.New("password must be at least 6 characters long")
	}
	return nil
}

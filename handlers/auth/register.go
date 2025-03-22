package auth

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type User struct {
	Nickname  string `json:"nickname"`
	Age       string `json:"age"`
	Gender    string `json:"gender"`
	Firstname string `json:"firstname"`
	Lastname  string `json:"lastname"`
	Email     string `json:"email"`
	Password  string `json:"password"`
}

func RegisterUser(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	fmt.Println("dkhl l REgister user")
	if r.Method != "POST" {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}
	var user User
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&user)
	if err != nil {
		fmt.Println("Error decoding JSON data:", err)
		http.Error(w, "Invalid JSON data", http.StatusBadRequest)
		return
	}
	fmt.Println("user", user)

	err = toSql(db, user)
	if err != nil {
		http.Error(w, "Error inserting user into database", http.StatusInternalServerError)
		return
	}
}

func toSql(db *sql.DB, user User) error {
	var query = "INSERT INTO users (nickname, age, gender, firstname, lastname, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)"
	_, err := db.Exec(query, user.Nickname, user.Age, user.Gender, user.Firstname, user.Lastname, user.Email, user.Password)
	if err != nil {
		log.Println("Error inserting user into database:", err)
		return err
	}
	return nil
}

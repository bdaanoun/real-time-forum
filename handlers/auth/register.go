package auth

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type User struct {
	Nickname  string `json:"nickname"`
	Age       int    `json:"age"`
	Gender    string `json:"gender"`
	Firstname string `json:"firstname"`
	Lastname  string `json:"lastname"`
	Email     string `json:"email"`
	Password  string `json:"password"`
}

func RegisterUser(w http.ResponseWriter, r *http.Request) {
	fmt.Println("dkhl l REgister user")
	if r.Method != "POST" {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	var user User
	fmt.Println("user khawi", user.Nickname)
	var data, err = json.Marshal(r.Body)
	if err != nil {
		fmt.Println("err", err)
	}
	fmt.Println("data", string(data))

	// err := json.NewDecoder(r.Body).Decode(&user)
	// if err != nil {
	// 	http.Error(w, err.Error(), http.StatusBadRequest)
	// 	return
	// }
	fmt.Println("user", user.Nickname)

}

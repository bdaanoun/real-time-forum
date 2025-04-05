package auth

import (
	"fmt"
	"net/http"
)


// check if a user has logged
func CheckAuth(w http.ResponseWriter, r *http.Request) {
	fmt.Println("dkjl")
	_, err := r.Cookie("Token")
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	w.WriteHeader(http.StatusOK)
}

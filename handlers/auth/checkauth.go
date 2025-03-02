package auth

import (
	"fmt"
	"net/http"
)

func CheckAuth(w http.ResponseWriter, r *http.Request) {
	fmt.Println("dkjl")
	_, err := r.Cookie("Token")
	if err != nil {
		fmt.Println(err )
		w.WriteHeader(http.StatusUnauthorized)
	}
	w.WriteHeader(http.StatusOK)
}

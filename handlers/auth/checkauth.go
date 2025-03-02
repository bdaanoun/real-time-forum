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
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

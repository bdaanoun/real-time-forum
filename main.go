package main

import (
	"fmt"
	"net/http"
	"strings"
)

func main() {

	http.HandleFunc("/api/", apihandler)
	http.HandleFunc("/", homehandler)
	fmt.Println("http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}

func homehandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	http.ServeFile(w,r,"index.html")

}

func apihandler(w http.ResponseWriter, r *http.Request) {
	url := strings.Split(r.URL.Path, "/")
	switch url[1] {
	case "register":
		registerUser(w , r )
	case "login":
		loginUser()
	
	case "checkAuth":

		checkAuth()

	case "getPosts":

		get
	}

}

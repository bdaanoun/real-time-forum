package auth

import (
	"net/http"
	"strings"
)

func Auth(w http.ResponseWriter, r *http.Request) {
	url := strings.Split(r.URL.Path, "/")
	switch url[2] {
	case "login":
		LogUser(w, r)
	case "register":
		RegisterUser(w, r)
	case "checkAuth":
		CheckAuth(w, r)
	}
}

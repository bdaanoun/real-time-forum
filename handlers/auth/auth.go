package auth

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"
)

func Auth(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	url := strings.Split(r.URL.Path, "/")
	switch url[3] {
	case "login":
		fmt.Println("/login")
		LogUser(w, r)
	case "register":
		fmt.Println("/register")
		RegisterUser(db, w, r)
	case "checkAUth":
		fmt.Println("/check")
		CheckAuth(w, r)
	}
}

package auth

import (
	"fmt"
	"net/http"
	"strings"
)

func Auth(w http.ResponseWriter, r *http.Request) {
	url := strings.Split(r.URL.Path, "/")
	fmt.Println(url[3])

	switch url[3] {
	case "login":
		LogUser(w, r)
	case "register":
		RegisterUser(w, r)
	case "checkAUth":
		CheckAuth(w, r)
	}
}

package auth

import (
	"fmt"
	"net/http"
	"strings"
)

func Auth(w http.ResponseWriter, r *http.Request) {
	url := strings.Split(r.URL.Path, "/")
	fmt.Println("url3", url[3])

	switch url[3] {
	case "login":
		fmt.Println("/login")
		LogUser(w, r)
	case "register":
		RegisterUser(w, r)
		fmt.Println("/register")
	case "checkAUth":
		fmt.Println("/check")
		CheckAuth(w, r)
	}
}

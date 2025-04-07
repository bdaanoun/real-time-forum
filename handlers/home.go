package handlers

import (
	"net/http"
)

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	// w.WriteHeader(http.StatusOK)
	// fmt.Println("hell")
	http.ServeFile(w, r, "static/index.html")
}

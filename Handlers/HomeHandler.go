package handlers

import "net/http"

func Homehandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	http.ServeFile(w, r, "index.html")
}

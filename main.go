package main

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"strings"

	Auth "real-time-forum/handlers/auth"
	Posts "real-time-forum/handlers/posts"
	Chat "real-time-forum/handlers/chat"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	forumDB, err := sql.Open("sqlite3", "./forum.db")
	if err != nil {
		fmt.Println(err)
		return
	} else {

		fmt.Println("success")
	}
	CreateTables(forumDB)
	defer forumDB.Close()
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	http.HandleFunc("/", homehandler)
	http.HandleFunc("/chat" , Chat.ChatHandler)
	http.HandleFunc("/api/", apihandler)

	fmt.Println("http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}

func homehandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	http.ServeFile(w, r, "index.html")
}




func apihandler(w http.ResponseWriter, r *http.Request) {
	url := strings.Split(r.URL.Path, "/")
	fmt.Println("dkhl", url[2])
	switch url[2] {
	case "auth":
		Auth.Auth(w, r)
	case "getPost":
		Posts.Getpost(w, r)
	case "setPost":
		Posts.SetPost(w, r)
	}
}

func CreateTables(forumDB *sql.DB)  {
	script , err :=  os.ReadFile("./schema.sql")
	if err != nil {
		fmt.Println(err)
	}
	res , err := forumDB.Exec(string(script))
	if err != nil {
		fmt.Println(err , res)
	}
}
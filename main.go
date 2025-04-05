package main

import (
	"database/sql"
	"fmt"
	"net/http"

	"forum/app/config"

	_ "github.com/mattn/go-sqlite3"
)

var forumDB *sql.DB

func dbInit() {
	var err error
	forumDB, err = sql.Open("sqlite3", "./forum.db")
	if err != nil {
		fmt.Println(err)
		return
	} else {
		fmt.Println("success")
	}
	config.CreateTables(forumDB)
}

func setupHandlers() {
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	http.HandleFunc("/", Homehandler)
	http.HandleFunc("/register", RegisterHanler)
	http.HandleFunc("/login", LoginHandler)
	http.HandleFunc("/chat", Chat.ChatHandler)
	http.HandleFunc("/CreatePost", Post.CreatPostHandler)
	http.HandleFunc("/GetPosts", Post.GetPostsHandler)
	http.HandleFunc("/GetPost", Post.GetPostHandler)
	http.HandleFunc("/GetComments", Comment.GetCommentsHandler)
	http.HandleFunc("/SetComment", Comment.SetCommentHandler)
	http.HandleFunc("/like", Reactions.LikeHandler)
	http.HandleFunc("/dislike", Reractions.DislikeHandler)
	http.HandleFunc("/Profile", ProfileHandler)
	http.HandleFunc("/CheckAuth", CheckAuthHandler)
}

func main() {
	dbInit()
	setupHandlers()
	fmt.Println("http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}

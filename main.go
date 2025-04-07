package main

import (
	"fmt"
	"net/http"

	"forum/handlers"
	"forum/handlers/auth"
	// Auth "forum/handlers/auth"
	Comment "forum/handlers/comment"
	Post "forum/handlers/posts"

	// "forum/handlers/chat"
	database "forum/handlers/dataBase"

	_ "github.com/mattn/go-sqlite3"
)

func setupHandlers() {
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	http.HandleFunc("/", handlers.HomeHandler)
	http.HandleFunc("/register", auth.RegisterUser)
	http.HandleFunc("/login", auth.LogUser)
	// http.HandleFunc("/chat", chat.ChatHandler)
	http.HandleFunc("/CreatePost", Post.SetPostHandler)
	http.HandleFunc("/GetPosts", Post.GetPostsHandler)
	http.HandleFunc("/GetComments", Comment.GetCommentsHandler)
	http.HandleFunc("/SetComment", Comment.SetCommentHandler)
	http.HandleFunc("/like", handlers.ReactionHandler)
	http.HandleFunc("/Profile", auth.ProfileHandler)
	http.HandleFunc("/CheckAuth", auth.CheckAuth)
}

func main() {
	database.DbInit()
	setupHandlers()
	fmt.Println("http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}

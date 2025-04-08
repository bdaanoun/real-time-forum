package main

import (
	"fmt"
	"net/http"

	"forum/handlers"
	"forum/handlers/auth"
	"forum/handlers/chat"

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
	http.HandleFunc("/api/Register", auth.RegisterUser)
	http.HandleFunc("/api/Login", auth.LogUser)
	http.HandleFunc("/api/Chat", chat.ChatHandler)
	http.HandleFunc("/api/CreatePost", Post.SetPostHandler)
	http.HandleFunc("/api/GetPosts", Post.GetPostsHandler)
	http.HandleFunc("/api/GetComments", Comment.GetCommentsHandler)
	http.HandleFunc("/api/SetComment", Comment.SetCommentHandler)
	http.HandleFunc("/api/Like", handlers.ReactionHandler)
	http.HandleFunc("/api/Profile", auth.ProfileHandler)
	http.HandleFunc("/api/CheckAuth", auth.CheckAuth)
}

func main() {
	database.DbInit()
	setupHandlers()
	fmt.Println("http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
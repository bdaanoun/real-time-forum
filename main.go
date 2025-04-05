package main

import (
	"fmt"
	"net/http"

	Post"forum/handlers/posts"
	"forum/handlers"
	"forum/handlers/auth"

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
	// http.HandleFunc("/CreatePost", Post.CreatPostHandler)
	// http.HandleFunc("/GetPosts", Post.GetPostsHandler)
	// http.HandleFunc("/GetPost", Post.GetPostHandler)
	http.HandleFunc("/SetPost", Post.SetPost)
	// http.HandleFunc("/GetComments", Comment.GetCommentsHandler)
	// http.HandleFunc("/SetComment", Comment.SetCommentHandler)
	// http.HandleFunc("/like", Reactions.LikeHandler)
	// http.HandleFunc("/dislike", Reractions.DislikeHandler)
	// http.HandleFunc("/Profile", ProfileHandler)
	// http.HandleFunc("/CheckAuth", CheckAuthHandler)
}

func main() {
	database.DbInit()
	setupHandlers()
	fmt.Println("http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}

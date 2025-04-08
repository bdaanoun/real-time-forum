package chat

import (
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
)

var (
	upgrader = websocket.Upgrader{}
	clients  = make(map[string]*websocket.Conn)
)

type Message struct {
	From    string `json:"from"`
	To      string `json:"to"`
	Content string `json:"content"`
}

func ChatHandler(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Upgrade failed:", err)
		http.Error(w, "WebSocket upgrade failed", http.StatusBadRequest)
		return
	}
	username := r.URL.Query().Get("user")
	if username == "" {
		conn.Close()
		return
	}
	clients[username] = conn
	fmt.Println(username, "connected")

	defer func() {
		delete(clients, username)
		conn.Close()
		fmt.Println(username, "disconnected")
	}()
	for {
		var msg Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			fmt.Println("Read erroor:", err)
			break
		}
		if targetConn, ok := clients[msg.To]; ok {
			targetConn.WriteJSON(msg)
		}
	}
}

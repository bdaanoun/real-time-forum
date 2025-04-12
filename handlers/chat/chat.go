package chat

import (
	"fmt"
	"net/http"
	"sync"

	database "forum/handlers/dataBase"

	"github.com/gorilla/websocket"
)

var (
	upgrader = websocket.Upgrader{}
	clients  = make(map[string]*websocket.Conn)
	mutex    = &sync.Mutex{}
)

type Message struct {
	From    string `json:"from"`
	To      string `json:"to"`
	Content string `json:"content"`
}

func saveMessageToDB(senderID, receiverID int, content string) error {
	// Use ForumDB instead of creating a new db connection
	query := `INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`
	_, err := database.ForumDB.Exec(query, senderID, receiverID, content)
	return err
}

func getUserID(nickname string) int {
	var userID int
	err := database.ForumDB.QueryRow("SELECT id FROM users WHERE nickname = ?", nickname).Scan(&userID)
	if err != nil {
		fmt.Println("Error getting user ID for", nickname, ":", err)
		return 0
	}
	return userID
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

	mutex.Lock()
	if existingConn, exists := clients[username]; exists {
		existingConn.Close()
	}
	clients[username] = conn
	mutex.Unlock()

	fmt.Println(username, "connected")

	defer func() {
		mutex.Lock()
		delete(clients, username)
		mutex.Unlock()
		conn.Close()
		fmt.Println(username, "disconnected")
	}()

	for {
		var msg Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			fmt.Println("Read error:", err)
			break
		}

		// Save the message to the database
		err = saveMessageToDB(getUserID(msg.From), getUserID(msg.To), msg.Content)
		if err != nil {
			fmt.Println("Error saving message to DB:", err)
			break
		}

		mutex.Lock()
		targetConn, ok := clients[msg.To]
		mutex.Unlock()

		if ok {
			err := targetConn.WriteJSON(msg)
			if err != nil {
				fmt.Println("Write error to", msg.To, ":", err)
				mutex.Lock()
				targetConn.Close()
				delete(clients, msg.To)
				mutex.Unlock()
			}
		}
	}
}

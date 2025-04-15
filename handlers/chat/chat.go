package chat

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	database "forum/handlers/dataBase"

	"github.com/gorilla/websocket"
)

type StatusChangeMessage struct {
	MessageType string `json:"messageType"`
	UserName      string `json:"userName"`
	IsOnline    bool   `json:"isOnline"`
}

var (
	upgrader = websocket.Upgrader{}
	clients  = make(map[string][]*websocket.Conn)
	mutex    = &sync.Mutex{}
)

type UserStatus struct {
	Nickname string `json:"nickname"`
	IsOnline bool   `json:"is_online"`
}

type Message struct {
	From    string `json:"from"`
	To      string `json:"to"`
	Content string `json:"content"`
}

func GetUsersListHandler(w http.ResponseWriter, r *http.Request) {
	currentNickname := r.URL.Query().Get("nickname")
	if currentNickname == "" {
		http.Error(w, "Missing nickname parameter", http.StatusBadRequest)
		return
	}
	rows, err := database.ForumDB.Query("SELECT nickname FROM users")
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var userList []UserStatus

	mutex.Lock()
	defer mutex.Unlock()

	for rows.Next() {
		var nickname string
		err := rows.Scan(&nickname)
		if err != nil {
			continue
		}

		if nickname == currentNickname {
			continue
		}

		connections, ok := clients[nickname]
		isOnline := ok && len(connections) > 0

		userList = append(userList, UserStatus{
			Nickname: nickname,
			IsOnline: isOnline,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userList)
}

func saveMessageToDB(senderID, receiverID int, content string) error {
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
	fmt.Println("in chatHandler")
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Upgrade failed:", err)
		http.Error(w, "WebSocket upgrade failed", http.StatusBadRequest)
		return
	}
	username := r.URL.Query().Get("nickname")
	if username == "" {
		conn.Close()
		return
	}
	handleNewConnection(username, conn)
	fmt.Println(username, "connected")

	go func() {
		defer func() {
			removeConnection(username, conn)
			fmt.Println(username, "disconnected")
		}()
		for {
			var msg Message
			err := conn.ReadJSON(&msg)
			if err != nil {
				fmt.Println("Read error:", err)
				break
			}
			err = saveMessageToDB(getUserID(msg.From), getUserID(msg.To), msg.Content)
			if err != nil {
				fmt.Println("Error saving message to DB:", err)
				break
			}

			RedirectMessage(msg)
		}
	}()
}

func handleNewConnection(userName string, conn *websocket.Conn) {
	clients[userName] = append(clients[userName], conn)
	msg := StatusChangeMessage{
		MessageType: "statusChange",
		UserName:      userName,
		IsOnline:    true,
	}
	broadcastToAll(msg)
}

func RedirectMessage(msg Message) {
	targetConns, ok := clients[msg.To]
	if ok {
		for i, conn := range targetConns {
			err := conn.WriteJSON(msg)
			if err != nil {
				targetConns = append(targetConns[:i], targetConns[i+1:]...)
				clients[msg.To] = targetConns
				if len(targetConns) == 0 {
					delete(clients, msg.To)
				}
			}
		}
	}
}

func broadcastToAll(msg StatusChangeMessage) {
	for _, conns := range clients {
		for _, conn := range conns {
			if err := conn.WriteJSON(msg); err != nil {
				log.Println("Broadcast error:", err)
			}
		}
	}
}

func removeConnection(username string, conn *websocket.Conn) {
	mutex.Lock()
	defer mutex.Unlock()

	conns := clients[username]
	for i, c := range conns {
		if c == conn {
			c.Close()
			conns = append(conns[:i], conns[i+1:]...)
			break
		}
	}

	if len(conns) == 0 {
		delete(clients, username)
		msg := StatusChangeMessage{
			MessageType: "statusChange",
			UserName:      username,
			IsOnline:    false,
		}
		broadcastToAll(msg)
	} else {
		clients[username] = conns
	}
}

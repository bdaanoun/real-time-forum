package chat

import (
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"forum/handlers/auth"
	database "forum/handlers/dataBase"

	"github.com/gorilla/websocket"
)

type StatusChangeMessage struct {
	MessageType string `json:"messageType"`
	UserName    string `json:"userName"`
	IsOnline    bool   `json:"isOnline"`
}

var (
	upgrader = websocket.Upgrader{}
	clients  = make(map[string][]*websocket.Conn)
	mutex    = &sync.Mutex{}
)

type Message struct {
	From    string `json:"sender_nickname"`
	To      string `json:"receiver_nickname"`
	Content string `json:"content"`
	Me      bool   `json:"me"`
	Sent_at string `json :  "sent_at"`
}

func saveMessageToDB(senderNickname, receiverNickname, content string) error {
	senderID := getUserID(senderNickname)
	receiverID := getUserID(receiverNickname)

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
	userID, err := auth.ValidateSession(r, database.ForumDB)
	if err != nil {
		http.Error(w, "Invalid session", http.StatusUnauthorized)
		return
	}
	username, err := getUserName(userID)
	if err != nil {
		http.Error(w, "unable to extract nickname from session", http.StatusInternalServerError)
		return
	}
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	fmt.Println("in chatHandler")
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Upgrade failed:", err)
		http.Error(w, "WebSocket upgrade failed", http.StatusBadRequest)
		return
	}
	handleNewConnection(username, conn)
	fmt.Println(username, "connected")

	defer func() {
		removeConnection(username, conn)
		fmt.Println(username, "disconnected")
	}()
	for {
		var msg Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			fmt.Println("here")
			fmt.Println("Read error:", err)
			break
		}
		if msg.Content == "" {
			return
		}

		// query := `SELECT user_id FROM sessions WHERE nickname = ?`
		// errs := database.ForumDB.QueryRow(query, username).Scan(&userID)

		// if errs == sql.ErrNoRows {
		// 	conn.Close()
		// 	http.Error(w, "session expired", http.StatusUnauthorized)
		// } else if errs != nil {

		// }
		err = saveMessageToDB(username, msg.To, msg.Content)
		if err != nil {
			fmt.Println("Error saving message to DB:", err)
			break
		}
		fmt.Println("message saved to db")
		msg.From = username
		msg.Sent_at = time.Now().Format(time.RFC3339)
		fmt.Println(msg)
		RedirectMessage(msg)
	}
}

func getUserName(userID int) (string, error) {
	var nickname string
	query := "SELECT nickname FROM users WHERE id = ?"
	err := database.ForumDB.QueryRow(query, userID).Scan(&nickname)
	if err != nil {
		return "", fmt.Errorf("could not get nickname: %v", err)
	}
	return nickname, nil
}

func handleNewConnection(userName string, conn *websocket.Conn) {
	clients[userName] = append(clients[userName], conn)
	msg := StatusChangeMessage{
		MessageType: "statusChange",
		UserName:    userName,
		IsOnline:    true,
	}
	broadcastToAll(msg)
}

func RedirectMessage(msg Message) {
	if targetConns, ok := clients[msg.To]; ok {
		for i := 0; i < len(targetConns); {
			msg.Me = false

			err := targetConns[i].WriteJSON(msg)
			if err != nil {
				// Remove bad connection
				targetConns = append(targetConns[:i], targetConns[i+1:]...)
				clients[msg.To] = targetConns
				if len(targetConns) == 0 {
					delete(clients, msg.To)
				}
			} else {
				i++
			}
		}
	}

	if sourceConns, ok := clients[msg.From]; ok {
		for i := 0; i < len(sourceConns); {
			outMsg := msg
			outMsg.Me = true

			err := sourceConns[i].WriteJSON(outMsg)
			if err != nil {
				sourceConns = append(sourceConns[:i], sourceConns[i+1:]...)
				clients[msg.From] = sourceConns
				if len(sourceConns) == 0 {
					delete(clients, msg.From)
				}
			} else {
				i++
			}
		}
	}

	fmt.Println("Message sent to both sender and recipient")
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
			UserName:    username,
			IsOnline:    false,
		}
		broadcastToAll(msg)
	} else {
		clients[username] = conns
	}
}

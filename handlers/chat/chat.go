package chat

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

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

type UserStatus struct {
	Nickname           string     `json:"nickname"`
	IsOnline           bool       `json:"is_online"`
	LastMessageContent *string    `json:"last_message_content"`
	LastMessageSentAt  *time.Time `json:"last_message_sent_at"`
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

	query := `
		SELECT
			u.nickname,
			(
				SELECT
					m.content
				FROM
					messages m
				WHERE
					(m.sender_id = cu.id AND m.receiver_id = u.id) OR (m.sender_id = u.id AND m.receiver_id = cu.id)
				ORDER BY
					m.sent_at DESC
				LIMIT 1
			) AS last_message_content,
			(
				SELECT
					m.sent_at
				FROM
					messages m
				WHERE
					(m.sender_id = cu.id AND m.receiver_id = u.id) OR (m.sender_id = u.id AND m.receiver_id = cu.id)
				ORDER BY
					m.sent_at DESC
				LIMIT 1
			) AS last_message_sent_at
		FROM
			users u
		JOIN
			users cu ON cu.nickname = ?
		WHERE
			u.nickname <> ?;
	`

	rows, err := database.ForumDB.Query(query, currentNickname, currentNickname)
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
		var lastMessageContent sql.NullString
		var lastMessageSentAt sql.NullTime

		err := rows.Scan(&nickname, &lastMessageContent, &lastMessageSentAt)
		if err != nil {
			continue
		}

		// Skip self (already filtered in WHERE clause, but just in case)
		if nickname == currentNickname {
			continue
		}

		connections, ok := clients[nickname]
		isOnline := ok && len(connections) > 0

		var messageContentPtr *string
		if lastMessageContent.Valid {
			messageContentPtr = &lastMessageContent.String
		}

		var messageSentAtPtr *time.Time
		if lastMessageSentAt.Valid {
			messageSentAtPtr = &lastMessageSentAt.Time
		}

		userList = append(userList, UserStatus{
			Nickname:           nickname,
			IsOnline:           isOnline,
			LastMessageContent: messageContentPtr,
			LastMessageSentAt:  messageSentAtPtr,
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
		UserName:    userName,
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
			UserName:    username,
			IsOnline:    false,
		}
		broadcastToAll(msg)
	} else {
		clients[username] = conns
	}
}

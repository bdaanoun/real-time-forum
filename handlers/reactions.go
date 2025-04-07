package handlers

import (
	"forum/handlers/auth"
	database "forum/handlers/dataBase"
	"net/http"
	"strconv"
)

func ReactionHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := auth.ValidateSession(r, database.ForumDB)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	itemType := r.URL.Query().Get("item_type")
	itemId := r.URL.Query().Get("item_id")
	reaction_type, err := strconv.Atoi(r.URL.Query().Get("reaction_type"))
	if err != nil {
		http.Error(w, "Invalid reaction type, it should be 1 or 0, -1", http.StatusBadRequest)
		return

	}

	if itemType == "" || itemId == "" {
		http.Error(w, "Missing item Type or item id", http.StatusBadRequest)
		return
	}

	if itemType != "posts" && itemType != "comments" {
		http.Error(w, "Invalid item type", http.StatusBadRequest)
		return
	}
	if itemType == "posts" {
		_, err := database.ForumDB.Exec(`INSERT INTO post_reactions (post_id, user_id, reaction_type) VALUES (?, ?, ?)
		ON CONFLICT(post_id, user_id) 
		DO UPDATE SET reaction_type = excluded.reaction_type`, itemId, userID, reaction_type)
		if err != nil {
			http.Error(w, "Failed to add reaction", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("Reaction added successfully"))

	}
	if itemType == "comments" {
		_, err := database.ForumDB.Exec(`INSERT INTO comment_reactions (comment_id, user_id, reaction_type) VALUES (?, ?, ?)
		ON CONFLICT(comment_id, user_id) 
		DO UPDATE SET reaction_type = excluded.reaction_type`, itemId, userID, reaction_type)
		if err != nil {
			http.Error(w, "Failed to add reaction", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("Reaction added successfully"))
		return
	}

}

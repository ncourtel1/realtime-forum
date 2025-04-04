package db

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"
)

func GenerateSessionID() string {
	return uuid.New().String()
}

func CreateSession(w http.ResponseWriter, userID int, username string) {
	oldSessionID, exists := SessionExists(userID)
	if exists {
		DeleteSession(oldSessionID)
	}
	sessionID := GenerateSessionID()

	// Set cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    sessionID,
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
		Secure:   false, // Set to true if using HTTPS
		SameSite: http.SameSiteLaxMode,
	})

	// Store session in server (implement this function)
	StoreSession(sessionID, userID, username)
}

type Session struct {
	UserID    int
	Username  string
	CreatedAt time.Time
}

var (
	sessions = make(map[string]Session)
	mutex    sync.RWMutex
)

func StoreSession(sessionID string, userID int, username string) {
	mutex.Lock()
	defer mutex.Unlock()
	sessions[sessionID] = Session{
		UserID:    userID,
		Username:  username,
		CreatedAt: time.Now(),
	}
}

func GetSession(sessionID string) (Session, bool) {
	mutex.RLock()
	defer mutex.RUnlock()
	session, exists := sessions[sessionID]
	return session, exists
}

func SessionExists(userID int) (string, bool) {
	mutex.RLock()
	defer mutex.RUnlock()
	for sessionID, session := range sessions {
		if session.UserID == userID {
			return sessionID, true
		}
	}
	return "", false
}

func DeleteSession(sessionID string) {
	mutex.Lock()
	defer mutex.Unlock()
	delete(sessions, sessionID)
}

func GetCookie(w http.ResponseWriter, r *http.Request) Session {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		//http.Redirect(w, r, "/login", http.StatusSeeOther)
		return Session{}
	}

	sessionID := cookie.Value
	session, exists := GetSession(sessionID)
	if !exists {
		//http.Redirect(w, r, "/login", http.StatusSeeOther)
		return Session{}
	}
	return session
}

func CheckSessionHandler(w http.ResponseWriter, r *http.Request) {
	session := GetCookie(w, r)

	if session.UserID == 0 {
		CommunicationMessage(w, "Unauthorized", true)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"userID":   session.UserID,
		"username": session.Username,
	})
}

func DeleteSessionHandler(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		return
	}
	sessionID := cookie.Value
	DeleteSession(sessionID)
	CommunicationMessage(w, "Logged out", false)
}

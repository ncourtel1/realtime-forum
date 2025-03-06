package server

import (
	"db"
	"fmt"
	"time"
)

func InitServer() {
	// Create a new server instance with specified timeout settings and max header bytes
	server := NewServer(":8080", 10*time.Second, 10*time.Second, 30*time.Second, 2*time.Second, 1<<20) // 1 MB max header size

	// Add handlers for different routes
	server.Handle("/register", db.CreateUser)
	server.Handle("/create_category", db.CreateCategory)
	server.Handle("/get_categories", db.ReadCategories)
	server.Handle("/get_user", db.ReadUser)
	server.Handle("/get_session", db.CheckSessionHandler)
	server.Handle("/delete_session", db.DeleteSessionHandler)
	server.Handle("/create_post", db.CreatePosts)
	server.Handle("/get_posts", db.ReadPost)
	server.Handle("/create_comment", db.CreateComments)
	server.Handle("/get_comments", db.ReadComment)
	server.Handle("/ws", handleConnections)

	go broadcastUsers()
	go handlePrivateMessages()

	// // Add middlewares
	// server.Use(middlewares.LoggingMiddleware)
	// server.Use(middlewares.NotFoundMiddleware)

	if err := server.Start(); err != nil {
		fmt.Printf("Error starting server: %v\n", err)
	}
}

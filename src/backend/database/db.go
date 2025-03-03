package db

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

func SetupDatabase() *sql.DB {
	// Code to setup database
	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		log.Fatal(err)
	}

	// Create users table
	createUsersTable := `
	CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT NOT NULL UNIQUE,
	gender TEXT NOT NULL,
	email TEXT NOT NULL UNIQUE,
	password TEXT NOT NULL,
	age INTEGER,
	last_name TEXT,
	first_name TEXT
	);`

	createPostsTable := `
	CREATE TABLE IF NOT EXISTS posts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT NOT NULL,
	content TEXT NOT NULL,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	category TEXT NOT NULL,
	user_id INTEGER NOT NULL,
	FOREIGN KEY(user_id) REFERENCES users(id) 
	FOREIGN KEY(category) REFERENCES categories(id)
	);`

	createCommentsTable := `
	CREATE TABLE IF NOT EXISTS comments (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT NOT NULL,
	content TEXT NOT NULL,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	post_id INTEGER NOT NULL,
	user_id INTEGER NOT NULL,
	FOREIGN KEY(post_id) REFERENCES posts(id),
	FOREIGN KEY(user_id) REFERENCES users(id)
	);`

	createCategoryTable := `
	CREATE TABLE IF NOT EXISTS categories (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL UNIQUE
	);`

	queries := []string{createUsersTable, createCategoryTable, createPostsTable, createCommentsTable}

	for _, query := range queries {
		statement, err := db.Prepare(query)
		if err != nil {
			log.Fatal(err)
		}
		_, err = statement.Exec()
		if err != nil {
			log.Fatal(err)
		}
		statement.Close()
	}
	return db
}

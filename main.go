package main

import (
	"log"
	"net/http"
)

func serveHome(w http.ResponseWriter, r *http.Request) {
	log.Println(r.URL)
	if r.URL.Path != "/" {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	http.ServeFile(w, r, "home.html")
}

func main() {

	hub := newHub() // Crée un "hub" pour gérer les connexions WebSocket
	go hub.run()    // Lance le hub en arrière-plan (goroutine)

	// Associe les routes aux handlers
	http.HandleFunc("/", serveHome) // Route principale (sert home.html)
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hub, w, r) // Gestion des connexions WebSocket
	})

	// Démarre le serveur HTTP
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

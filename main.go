package main

import (
	"colors/server"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var clients = make(map[*websocket.Conn]bool) // Keep track of connected clients
var broadcast = make(chan Message)           // Channel for broadcasting messages to clients
var mu sync.Mutex                            // Mutex for thread-safe access to game state

type Message struct {
	Action           string            `json:"action"`
	ButtonClick      *server.ButtonClick `json:"buttonClick"`
	Score            int               `json:"score"`
	IsLocked         bool              `json:"isLocked"`
	PlayerClicksLeft int               `json:"playerClicksLeft"`
	Pattern          []server.ButtonClick `json:"pattern"`
}

var game = server.GameState{
	Pattern:          make([]server.ButtonClick, 0),
	PlayerTurn:       make([]server.ButtonClick, 0),
	IsLocked:         false,
	Score:            0,
	PlayerClicksLeft: 0,
}

func main() {
	fs := http.FileServer(http.Dir("./web"))
	http.Handle("/", fs)

	http.HandleFunc("/ws", handleConnections) // WebSocket route

	// Start listening for incoming messages and broadcasting them
	go handleMessages()

	wifiIP := "localhost:8080"
	log.Printf("Server starting on http://%s", wifiIP)
	if err := http.ListenAndServe(wifiIP, nil); err != nil {
		log.Fatal(err)
	}
}

// Handle WebSocket connections
func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	clients[ws] = true

	for {
		var msg Message
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("Error: %v", err)
			delete(clients, ws)
			break
		}

		// Handle different actions received from clients
		switch msg.Action {
		case "click":
			handleClickWS(msg.ButtonClick)
		case "lock":
			handleLockWS()
		case "reset":
			handleResetWS()
		}

		// Broadcast updated game state
		broadcast <- Message{
			Action:           "update",
			Score:            game.Score,
			IsLocked:         game.IsLocked,
			PlayerClicksLeft: game.PlayerClicksLeft,
			Pattern:          game.Pattern,
		}
	}
}

func handleClickWS(click *server.ButtonClick) {
	mu.Lock()
	defer mu.Unlock()
	
	log.Print(click.FromPlayer)
	if !click.FromPlayer {
		game.Pattern = append(game.Pattern, *click)
		game.PlayerClicksLeft++
	}
	if click.FromPlayer && game.IsLocked {
		game.PlayerTurn = append(game.PlayerTurn, *click)
		game.PlayerClicksLeft--

		if len(game.PlayerTurn) == len(game.Pattern) {
			matches := true
			for i := range game.PlayerTurn {
				if game.PlayerTurn[i].Id != game.Pattern[i].Id {
					matches = false
					break
				}
			}

			if matches && len(game.Pattern) >= 3 {
				game.Score += calculateScore(len(game.Pattern))
			}

			game.Pattern = make([]server.ButtonClick, 0)
			game.PlayerTurn = make([]server.ButtonClick, 0)
			game.IsLocked = false
		}
	}
}

func handleLockWS() {
	mu.Lock()
	defer mu.Unlock()

	if len(game.Pattern) < 3 {
		return
	}

	game.IsLocked = true
	game.PlayerTurn = make([]server.ButtonClick, 0)
}

func handleResetWS() {
	mu.Lock()
	defer mu.Unlock()

	game.Pattern = make([]server.ButtonClick, 0)
	game.PlayerTurn = make([]server.ButtonClick, 0)
	game.IsLocked = false
	game.Score = 0
	game.PlayerClicksLeft = 0
}

// Broadcast messages to all connected clients
func handleMessages() {
	for {
		msg := <-broadcast
		for client := range clients {
			err := client.WriteJSON(msg)
			if err != nil {
				log.Printf("Error: %v", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}

func calculateScore(patternLength int) int {
	score := 10
	if patternLength >= 5 {
		score += 20
	}
	if patternLength >= 8 {
		score += 40
	}
	if patternLength >= 10 {
		score += 80
	}
	return score
}


// package main

// import (
// 	"colors/server"
// 	"encoding/json"
// 	"log"
// 	"net/http"
// )


// func main() {
// 	fs := http.FileServer(http.Dir("./web"))
// 	http.Handle("/", fs)

// 	http.HandleFunc("/api/click", handleClick)
// 	http.HandleFunc("/api/lock", handleLock)
// 	// http.HandleFunc("/api/unlock", handleUnlock)
// 	http.HandleFunc("/api/pattern", server.GetPattern)
// 	http.HandleFunc("/api/reset", handleReset)
	
// 	//wifiIP := "192.168.43.54:8080"
// 	// wifiIP := "192.168.0.109:8080" 
// 	wifiIP :="localhost:8080"
// 	log.Printf("Server starting on http://%s",wifiIP)
// 	if err := http.ListenAndServe(wifiIP, nil); err != nil {
// 		log.Fatal(err)
// 	}
// }

// var game = server.GameState{
// 	Pattern:    make([]server.ButtonClick, 0),
// 	PlayerTurn: make([]server.ButtonClick, 0),
// 	IsLocked:   false,
// 	Score:      0,
// 	PlayerClicksLeft: 0,
// }

// func handleClick(w http.ResponseWriter, r *http.Request) {

// 	if r.Method != http.MethodPost {
// 		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
// 		return
// 	}

// 	var click server.ButtonClick
// 	if err := json.NewDecoder(r.Body).Decode(&click); err != nil {
// 		http.Error(w, err.Error(), http.StatusBadRequest)
// 		return
// 	}

// 	log.Print(click.FromPlayer);
// 	game.Mu.Lock()
// 	defer game.Mu.Unlock()
// 	if !click.FromPlayer {
// 		// This adds to the pattern if not the player's turn and game isn't locked
// 		game.Pattern = append(game.Pattern, click)
// 		game.PlayerClicksLeft ++
// 		log.Print(game.PlayerClicksLeft)
// 		log.Printf("Added to pattern - Color: %s, Id: %d", click.Color, click.Id)
// 	}
// 	if click.FromPlayer && game.IsLocked {
// 		// Now it's the player's turn
		
// 		game.PlayerTurn = append(game.PlayerTurn, click)
		
// 			game.PlayerClicksLeft--
		
// 		log.Print(game.PlayerClicksLeft)
// 		log.Printf("Added to playerTurn - Color: %s, Id: %d", click.Color, click.Id)
	
// 		// Validate the player's sequence only after all inputs are in
// 		if len(game.PlayerTurn) == len(game.Pattern) {
			
// 			log.Println("Validating player's sequence...")
// 			matches := true
	
// 			// Compare each step in the sequence
// 			for i := range game.PlayerTurn {
// 				if game.PlayerTurn[i].Id != game.Pattern[i].Id {
// 					matches = false
// 					log.Printf("Mismatch at position %d: Expected Id %d, Got Id %d", i, game.Pattern[i].Id, game.PlayerTurn[i].Id)
// 					break
// 				}
// 			}
	
// 			// If the player matched the pattern, update the score
// 			if matches && len(game.Pattern) >= 3 {
// 				game.Score+=10
// 				if len(game.Pattern) >= 5{
// 					game.Score+=20
// 				}
// 				if len(game.Pattern) >= 8{
// 					game.Score+=40
// 				}
// 				if len(game.Pattern) >= 10{
// 					game.Score+=80
// 				}	
// 				log.Printf("Pattern matched! Score incremented to: %d", game.Score)
// 			}
// 			if (game.PlayerClicksLeft==0){
// 				game.IsLocked = false
// 			}
// 			game.Pattern = make([]server.ButtonClick, 0)
// 			game.PlayerTurn = make([]server.ButtonClick, 0)
			
// 		}
		
// 	}
	
// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(map[string]interface{}{
// 		"status":   "success",
// 		"score":    game.Score,
// 		"isLocked": game.IsLocked,
// 		"playerClicksLeft": game.PlayerClicksLeft,
// 	})
// }

// func handleLock(w http.ResponseWriter, r *http.Request) {

// 	if r.Method != http.MethodPost {
// 		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
// 		return
// 	}

// 	game.Mu.Lock()
// 	defer game.Mu.Unlock()

// 	if len(game.Pattern) < 3 {
// 		http.Error(w, "Pattern must be at least 3 clicks", http.StatusBadRequest)
// 		log.Printf("Must be at least 3!!!")
// 		return 
// 	}

// 	game.IsLocked = true
// 	log.Printf("LOCKED")
// 	game.PlayerTurn = make([]server.ButtonClick, 0)

// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(map[string]interface{}{
// 		"status": "success",
// 		"isLocked": game.IsLocked,
// 		"score": game.Score,
// 		"pattern": game.Pattern,

// 	})
// }

// // func handleUnlock(w http.ResponseWriter, r *http.Request) {
// // 	log.Printf("Unlocking...")
// // 	if r.Method != http.MethodPost {
// // 		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
// // 		return
// // 	}

// // 	game.mu.Lock()
// // 	defer game.mu.Unlock()

// // 	game.IsLocked = false
// // 	log.Printf("UNLOCKED")
// // 	game.Pattern = make([]ButtonClick, 0)
// // 	game.PlayerTurn = make([]ButtonClick, 0)
// // 	game.PlayerClicksLeft = 0

// // 	w.Header().Set("Content-Type", "application/json")
// // 	json.NewEncoder(w).Encode(map[string]interface{}{
// // 		"status": "success",
// // 		"isLocked": game.IsLocked,
// // 		"playerClicksLeft": game.PlayerClicksLeft,
// // 	})
// // }

// // func getPattern(w http.ResponseWriter, r *http.Request) {
// // 	if r.Method != http.MethodGet {
// // 		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
// // 		return
// // 	}

// // 	game.mu.RLock()
// // 	defer game.mu.RUnlock()

// // 	w.Header().Set("Content-Type", "application/json")
// // 	json.NewEncoder(w).Encode(map[string]interface{}{
// // 		"pattern": game.Pattern,
// // 		"score":   game.Score,
// // 		"playerClicksLeft": game.PlayerClicksLeft,
// // 		"isLocked": game.IsLocked,
// // 	})
// // }

// func handleReset(w http.ResponseWriter, r *http.Request) {

// 	if r.Method != http.MethodPost {
// 		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
// 		return
// 	}

// 	game.Mu.Lock()
// 	game.Pattern = make([]server.ButtonClick, 0)
// 	game.PlayerTurn = make([]server.ButtonClick, 0)
// 	game.IsLocked = false
// 	game.Score = 0
// 	game.PlayerClicksLeft = 0
// 	game.Mu.Unlock()

// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(map[string]interface{}{
// 		"status": "success",
// 		"score": game.Score,
// 		"playerClicksLeft": game.PlayerClicksLeft,

// 	})
// }

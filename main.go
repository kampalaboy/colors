package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
)

type ButtonClick struct {
	Color string `json:"color"`
	Note  string `json:"note"`
	Key   string `json:"key"`
	Id    int    `json:"id"`
	FromPlayer bool `json:"fromPlayer"`
}

type GameState struct {
	Pattern    []ButtonClick `json:"pattern"`    // Random clicks pattern
	PlayerTurn []ButtonClick `json:"playerTurn"` // Player's attempts
	IsLocked   bool         `json:"isLocked"`    // Whether pattern is locked
	Score      int          `json:"score"`       // Player's score
	PlayerClicksLeft   int `json:"playerClicksLeft"` 
	mu         sync.RWMutex
}

var game = GameState{
	Pattern:    make([]ButtonClick, 0),
	PlayerTurn: make([]ButtonClick, 0),
	IsLocked:   false,
	Score:      0,
	PlayerClicksLeft: 0,
}

func main() {
	fs := http.FileServer(http.Dir("./web"))
	http.Handle("/", fs)

	http.HandleFunc("/api/click", handleClick)
	http.HandleFunc("/api/lock", handleLock)
	http.HandleFunc("/api/unlock", handleUnlock)
	http.HandleFunc("/api/pattern", getPattern)
	http.HandleFunc("/api/reset", handleReset)
	
	//wifiIP := "192.168.43.54:8080"
	wifiIP := "192.168.0.109:8080" 
	log.Printf("Server starting on http://%s",wifiIP)
	if err := http.ListenAndServe(wifiIP, nil); err != nil {
		log.Fatal(err)
	}
}

func handleClick(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var click ButtonClick
	if err := json.NewDecoder(r.Body).Decode(&click); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Print(click.FromPlayer);
	game.mu.Lock()
	defer game.mu.Unlock()
	if !click.FromPlayer {
		// This adds to the pattern if not the player's turn and game isn't locked
		game.Pattern = append(game.Pattern, click)
		game.PlayerClicksLeft ++
		log.Print(game.PlayerClicksLeft)
		log.Printf("Added to pattern - Color: %s, Id: %d", click.Color, click.Id)
	} else {
		// Now it's the player's turn
		
		game.PlayerTurn = append(game.PlayerTurn, click)
		game.PlayerClicksLeft--
		log.Print(game.PlayerClicksLeft)
		log.Printf("Added to playerTurn - Color: %s, Id: %d", click.Color, click.Id)
	
		// Validate the player's sequence only after all inputs are in
		if len(game.PlayerTurn) == len(game.Pattern) {
			log.Println("Validating player's sequence...")
			matches := true
	
			// Compare each step in the sequence
			for i := range game.PlayerTurn {
				if game.PlayerTurn[i].Id != game.Pattern[i].Id {
					matches = false
					log.Printf("Mismatch at position %d: Expected Id %d, Got Id %d", i, game.Pattern[i].Id, game.PlayerTurn[i].Id)
					break
				}
			}
	
			// If the player matched the pattern, update the score
			if matches && len(game.Pattern) >= 3 {
				game.Score++
				log.Printf("Pattern matched! Score incremented to: %d", game.Score)
			}
			// if (game.PlayerClicksLeft==0){
			// 	game.IsLocked = false
			// }
			game.Pattern = make([]ButtonClick, 0)
			game.PlayerTurn = make([]ButtonClick, 0)
			game.IsLocked = false
		}
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":   "success",
		"score":    game.Score,
		"isLocked": game.IsLocked,
		"playerClicksLeft": game.PlayerClicksLeft,
	})
}

func handleLock(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	game.mu.Lock()
	defer game.mu.Unlock()

	if len(game.Pattern) < 3 {
		http.Error(w, "Pattern must be at least 3 clicks", http.StatusBadRequest)
		log.Printf("Must be at least 3!!!")
		return 
	}

	game.IsLocked = true
	log.Printf("LOCKED")
	game.PlayerTurn = make([]ButtonClick, 0)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
		"isLocked": game.IsLocked,
		"score": game.Score,
		"pattern": game.Pattern,

	})
}

func handleUnlock(w http.ResponseWriter, r *http.Request) {
	log.Printf("Unlocking...")
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	game.mu.Lock()
	defer game.mu.Unlock()

	game.IsLocked = false
	log.Printf("UNLOCKED")
	game.Pattern = make([]ButtonClick, 0)
	game.PlayerTurn = make([]ButtonClick, 0)
	game.PlayerClicksLeft = 0

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
		"isLocked": game.IsLocked,
		"playerClicksLeft": game.PlayerClicksLeft,
	})
}

func getPattern(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	game.mu.RLock()
	defer game.mu.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"pattern": game.Pattern,
		"score":   game.Score,
		"playerClicksLeft": game.PlayerClicksLeft,
		"isLocked": game.IsLocked,
	})
}

func handleReset(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	game.mu.Lock()
	game.Pattern = make([]ButtonClick, 0)
	game.PlayerTurn = make([]ButtonClick, 0)
	game.IsLocked = false
	game.Score = 0
	game.PlayerClicksLeft = 0
	game.mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
		"score": game.Score,
		"playerClicksLeft": game.PlayerClicksLeft,

	})
}
// package main

// import (
// 	"encoding/json"
// 	"log"
// 	"net/http"
// 	"sync"
// )

// // ButtonClick defines the structure for button click data
// type ButtonClick struct {
// 	Color string `json:"color"`
// 	Note  string `json:"note"`
// 	Key   string `json:"key"`
// 	Id    int    `json:"id"`
// }

// // ColorHistory stores the history of clicks
// type ColorHistory struct {
// 	clicks []ButtonClick
// 	mu     sync.RWMutex
// }

// var history = ColorHistory{
// 	clicks: make([]ButtonClick, 0),
// }

// func main() {
// 	// Handle static files
// 	fs := http.FileServer(http.Dir("./web"))
// 	http.Handle("/", fs)

// 	// Handle button clicks
// 	http.HandleFunc("/api/click", handleClick)

// 	// Handle color history
// 	http.HandleFunc("/api/colors", iterateColorList)

// 	log.Println("Server starting on http://localhost:8080")
// 	if err := http.ListenAndServe(":8080", nil); err != nil {
// 		log.Fatal(err)
// 	}
// }

// func handleClick(w http.ResponseWriter, r *http.Request) {
// 	if r.Method != http.MethodPost {
// 		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
// 		return
// 	}

// 	var click ButtonClick
// 	if err := json.NewDecoder(r.Body).Decode(&click); err != nil {
// 		http.Error(w, err.Error(), http.StatusBadRequest)
// 		return
// 	}

// 	// Add click to history
// 	history.mu.Lock()
// 	click.Id = len(history.clicks)
// 	history.clicks = append(history.clicks, click)
// 	history.mu.Unlock()

// 	// Log the click event
// 	log.Printf("Button clicked - Color: %s, Note: %s, Key: %s, Id: %d",
// 		click.Color, click.Note, click.Key, click.Id)

// 	// Send response
// 	w.WriteHeader(http.StatusOK)
// 	json.NewEncoder(w).Encode(map[string]string{
// 		"status": "success",
// 	})
// }

// func iterateColorList(w http.ResponseWriter, r *http.Request) {
// 	if r.Method != http.MethodGet {
// 		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
// 		return
// 	}

// 	// Get cursor from query parameter
// 	cursor := r.URL.Query().Get("cursor")
// 	if cursor == "" {
// 		cursor = "0"
// 	}

// 	// Return all clicks after cursor
// 	history.mu.RLock()
// 	defer history.mu.RUnlock()

// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(history.clicks)
// }

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
	mu         sync.RWMutex
}

var game = GameState{
	Pattern:    make([]ButtonClick, 0),
	PlayerTurn: make([]ButtonClick, 0),
	IsLocked:   false,
	Score:      0,
}

func main() {
	fs := http.FileServer(http.Dir("./web"))
	http.Handle("/", fs)

	http.HandleFunc("/api/click", handleClick)
	http.HandleFunc("/api/lock", handleLock)
	http.HandleFunc("/api/pattern", getPattern)
	http.HandleFunc("/api/reset", handleReset)

	log.Println("Server starting on http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
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
	if !click.FromPlayer && !game.IsLocked {
		// This adds to the pattern if not the player's turn and game isn't locked
		game.Pattern = append(game.Pattern, click)
		log.Printf("Added to pattern - Color: %s, Id: %d", click.Color, click.Id)
	} else if click.FromPlayer && game.IsLocked {
		// Now it's the player's turn
		game.PlayerTurn = append(game.PlayerTurn, click)
		log.Printf("Added to playerTurn - Color: %s, Id: %d", click.Color, click.Id)
	
		// Validate the player's sequence only after all inputs are in
		if len(game.PlayerTurn) == len(game.Pattern) {

			game.IsLocked = false 

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
			} else {
				log.Println("Pattern mismatch or too short.")
			}
	
			// Reset player turn for next round
			 game.PlayerTurn = make([]ButtonClick, 0)
			
		}
	}
	

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":   "success",
		"score":    game.Score,
		"isLocked": game.IsLocked,
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
		"pattern": game.Pattern,
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
	game.mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "success",
	})
}
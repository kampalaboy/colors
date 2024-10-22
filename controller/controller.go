package controller

import (
	"encoding/json"
	"net/http"
	"sort"
	"sync"
)
type Account struct{
	Id int `json:"id"`
	UserName string `json:"username"`
}

type Gamer struct{
	Id int `json:"id"`
	UserName string	`json:"username"`
	TopScore int64 `json:"topScore"`
}

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
	Mu         sync.RWMutex
}

var Game = &GameState{
	Pattern:    make([]ButtonClick, 0),
	PlayerTurn: make([]ButtonClick, 0),
	IsLocked:   false,
	Score:      0,
	PlayerClicksLeft: 0,
}


var playerScores = make(map[string]int64) // key is username, value is cumulative score
var onlinePlayers = make([]Account, 0)    // List of online players
var mu sync.Mutex


func GetPattern(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	Game.Mu.RLock()
	defer Game.Mu.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"pattern": Game.Pattern,
		"PlayerTurn": Game.PlayerTurn,
		"score":   Game.Score,
		"playerClicksLeft": Game.PlayerClicksLeft,
		"isLocked": Game.IsLocked,
	})
}

// Login handler to register players and return top scorers and online players
func Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var player Account
	var id = player.Id
	err := json.NewDecoder(r.Body).Decode(&player)
	if err != nil || player.UserName == "" {
		http.Error(w, "Invalid username", http.StatusBadRequest)
		return
	}

	mu.Lock()
	onlinePlayers = append(onlinePlayers, player)
	mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id": id,
		"topScorers":    getTopScorers(),
		"onlinePlayers": onlinePlayers,
	})
}

func AddScore(username string, score int64) {
	mu.Lock()
	defer mu.Unlock()
	playerScores[username] += score
}

// getTopScorers returns a sorted list of the top scorers by their cumulative score
func getTopScorers() []Gamer {
	mu.Lock()
	defer mu.Unlock()

	// Convert map to slice for sorting
	var gamers []Gamer
	for username, score := range playerScores {
		gamers = append(gamers, Gamer{
			UserName: username,
			TopScore: score,
		})
	}

	// Sort gamers by TopScore in descending order
	sort.Slice(gamers, func(i, j int) bool {
		return gamers[i].TopScore > gamers[j].TopScore
	})

	// Return the top 10 players
	if len(gamers) > 10 {
		return gamers[:10]
	}
	return gamers
}
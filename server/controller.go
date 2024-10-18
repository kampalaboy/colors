package server

import (
	"encoding/json"
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
	Mu         sync.RWMutex
}

var Game = GameState{
	Pattern:    make([]ButtonClick, 0),
	PlayerTurn: make([]ButtonClick, 0),
	IsLocked:   false,
	Score:      0,
	PlayerClicksLeft: 0,
}

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
		"score":   Game.Score,
		"playerClicksLeft": Game.PlayerClicksLeft,
		"isLocked": Game.IsLocked,
	})
}

func Authentication(){

}

func TopScorers (){

}


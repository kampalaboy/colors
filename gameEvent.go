package main

import (
	"encoding/json"
	"sync"
)

type GameEvent struct{
	EventType string	`json:"type"`
	EventPayload json.RawMessage `json:"payload"`
}

type GameEventHandler func(gameEvent GameEvent, g *Gamer) error

const (EventNewGamer = "new_gamer"
		EventMessage = "new_message"
		EventListen = "new_listen"
		EventDecypher = "new_cypher"
		EventClick = "new_clicks"
)

type SendMessageEvent struct{
	Message string `json:"message"`
	From string `json:"from"`
}

type ButtonClick struct {
	Id    int    `json:"id"`
	Color string `json:"color"`
	Note  string `json:"note"`
	Key   string `json:"key"`
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

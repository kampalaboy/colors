package main

import (
	"encoding/json"
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

type ClickButtons struct{
	
}
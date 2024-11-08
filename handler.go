package main

import (
	"colors/controller"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var(
	websocketUpgrader = websocket.Upgrader{
		CheckOrigin: checkOrigin,
		ReadBufferSize: 1024,
		WriteBufferSize: 1024,
	}
)


var game = &controller.GameState{
	Pattern:          make([]controller.ButtonClick, 0),
	PlayerTurn:       make([]controller.ButtonClick, 0),
	IsLocked:         false,
	Score:            0,
	PlayerClicksLeft: 0,
}

type Handler struct{
	gamers GamerList
	sync.RWMutex

	referees map[string]GameEventHandler
}



func NewHandler() *Handler{
	h:= &Handler{
		gamers: make(GamerList),
		referees: make(map[string]GameEventHandler),
	}
	h.setupGameEvents()
	return h
}

func (h *Handler) setupGameEvents(){
	h.referees[EventNewGamer] = newGamer
	h.referees[EventClick] = newClicks
}

func newGamer (event GameEvent, g *Gamer)error{
	fmt.Println(event)
	return nil
}
func newClicks (event GameEvent, g *Gamer)error{
	fmt.Println(event)
	return nil
}

func (h *Handler)actionEvent (event GameEvent, g *Gamer)error{
	if ref, ok := h.referees[event.EventType]; ok{
		if err := ref(event, g); err != nil{
			return err
		}
		return nil
	}else{
		return errors.New("event non exisistent")
	}
}

func (h *Handler) JoinGameServer (w http.ResponseWriter, r *http.Request){
	type OnlinePlayer struct{
		WorkingServer string `json:"workingserver"`
		UserName string `json:"username"`
	}

	var onlinePlayer OnlinePlayer

	if err := json.NewDecoder(r.Body).Decode(&onlinePlayer); err != nil{
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var onlinePlayers []string
	onlinePlayersList := append(onlinePlayers,onlinePlayer.UserName)
	log.Println(onlinePlayersList)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
		"status":   "success",
		"workingserver":    onlinePlayer.WorkingServer,
		"username": onlinePlayer.UserName,
	})
}

func(h *Handler) handleClickWS(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	h.Lock()
	defer h.Unlock()
	
	var click controller.ButtonClick
		if err := json.NewDecoder(r.Body).Decode(&click); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Println(click.FromPlayer)
	if !click.FromPlayer {
		game.Pattern = append(game.Pattern, click)
		game.PlayerClicksLeft++
	}
	if click.FromPlayer && game.IsLocked {
		game.PlayerTurn = append(game.PlayerTurn, click)
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

			game.Pattern = make([]controller.ButtonClick, 0)
			game.PlayerTurn = make([]controller.ButtonClick, 0)
			game.IsLocked = false
		}
	}


	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
 		"status":   "success",
 		"score":    game.Score,
 		"isLocked": game.IsLocked,
		"pattern": game.Pattern,
		"playerTurn": game.PlayerTurn,
 		"playerClicksLeft": game.PlayerClicksLeft,
	})
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

func (h *Handler) serveWS(w http.ResponseWriter, r *http.Request){
	log.Println("new socket")

	conn, err := websocketUpgrader.Upgrade(w, r, nil)
	if err != nil{
		log.Println(err)
		return 
	}

	gamer := NewGamer(conn, h)
	h.addGamer(gamer)

	//licks := 

	go gamer.readMessages()
	go gamer.WriteMessages()
	//conn.Close()
}

func (h *Handler) addGamer (gamer *Gamer){
	h.Lock()
	defer h.Unlock()

	h.gamers[gamer] = true
}

func (h *Handler) removeGamer (gamer *Gamer){
	h.Lock()
	defer h.Unlock()

	if _, ok  := h.gamers[gamer]; ok{
		gamer.connection.Close()
		delete(h.gamers, gamer)
	}

}

func checkOrigin(r *http.Request) bool{
	origin := r.Header.Get("Origin")

	switch origin{
	case "https://localhost:8080":
		return true
	case "0.0.0.0:80":
		return true
	default:
		return false
	}
}
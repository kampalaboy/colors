package main

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var(
	websocketUpgrader = websocket.Upgrader{
		ReadBufferSize: 1024,
		WriteBufferSize: 1024,
	}
)

type Handler struct{
	gamers GamerList
	sync.RWMutex
}

func NewHandler() *Handler{
	return &Handler{
		gamers: make(GamerList),
	}
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
package main

import (
	"log"

	"github.com/gorilla/websocket"
)

type GamerList map[*Gamer]bool

type Gamer struct {
	connection *websocket.Conn
	handler *Handler
	broadcast	chan[]byte
}

func NewGamer(conn *websocket.Conn, handler *Handler) *Gamer {
	return &Gamer{
		connection: conn,
		handler: handler,
		broadcast: make(chan[]byte),
	}
}

func (g *Gamer)readMessages(){
	defer func(){
		g.handler.removeGamer(g)
	}()
	for{
		messageType, payload, err := g.connection.ReadMessage()
		if err != nil{
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure){
				log.Printf("Error: %v", err)
			}
			break
		}

		for wsgamer := range g.handler.gamers{
			wsgamer.broadcast <- payload
		}
		log.Println(messageType)
		log.Println(string(payload))
	}
}

func (g *Gamer) WriteMessages(){
	defer func(){
		g.handler.removeGamer(g)
	}()
	
	for{
		select{
		case message, ok := <- g.broadcast:
			if !ok {
				if err := g.connection.WriteMessage(websocket.CloseMessage, nil); err !=nil{
					log.Println("socket closed: " ,err )
				}
				return
			}
			if err := g.connection.WriteMessage(websocket.TextMessage, message); err !=nil{
				log.Printf("failed to send message: %v" ,err )
			}
			log.Println("message sent")
		}
	}
}

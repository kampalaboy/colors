package main

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

var(
	pongWait = 10 * time.Second

	pingInterval = (pongWait*9 )/10
)
type GamerList map[*Gamer]bool

type Gamer struct {
	connection *websocket.Conn
	handler *Handler
	broadcast	chan GameEvent
}

func NewGamer(conn *websocket.Conn, handler *Handler) *Gamer {
	return &Gamer{
		connection: conn,
		handler: handler,
		broadcast: make(chan GameEvent),
	}
}

func (g *Gamer)readMessages(){
	defer func(){
		g.handler.removeGamer(g)
	}()

	if err := g.connection.SetReadDeadline(time.Now().Add(pongWait)); err != nil{
		println(err)
		return
	}
	g.connection.SetPongHandler(g.pongHandler)
	for{
		_, payload, err := g.connection.ReadMessage()
		if err != nil{
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure){
				log.Printf("Error: %v", err)
			}
			break
		}

		// for wsgamer := range g.handler.gamers{
		// 	wsgamer.broadcast <- payload
		// }
		// log.Println(messageType)
		// log.Println(string(payload))

		var request GameEvent
		if err := json.Unmarshal(payload, &request); err !=nil{
			log.Printf("error unmarshalling: %v", err)
		}
		if err := g.handler.actionEvent(request, g); err !=nil{
			log.Println("error handling message: ", err)
		}
	}
}

func (g *Gamer) WriteMessages(){
	defer func(){
		g.handler.removeGamer(g)
	}()
	
	ticker := time.NewTicker(pingInterval)
	for{
		select{
		case message, ok := <- g.broadcast:
			if !ok {
				if err := g.connection.WriteMessage(websocket.CloseMessage, nil); err !=nil{
					log.Println("socket closed: " ,err )
				}
				return
			}

			data, err := json.Marshal(message)
			if err != nil{
				log.Println(err)
				return
			}
			if err := g.connection.WriteMessage(websocket.TextMessage, data); err !=nil{
				log.Printf("failed to send message: %v" ,err )
			}
			log.Println("message sent")

		case <- ticker.C:
			log.Println("Ping!")
			if err := g.connection.WriteMessage(websocket.PingMessage,[]byte(``)); err !=nil{
				log.Printf("failed to send ping: %v" ,err )
				return
			}

		}
		
	}
}

func (g *Gamer) pongHandler(pongMsg string)error{
	log.Println("Pong!")
	return g.connection.SetReadDeadline(time.Now().Add(pongWait))
}

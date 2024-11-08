package main

import (
	"colors/controller"
	"log"
	"net/http"
)

func main(){
	connectHttpServer()
	port := "8080"
	log.Printf("Started on %s", port)
	//log.Fatal(http.ListenAndServe(port, nil ))
	log.Fatal(http.ListenAndServeTLS("0.0.0.0:"+port, "game.crt", "game.key", nil ))

	//wifiIP := "localhost:3000"
	
	//log.Printf("Server starting on http://%s", wifiIP)

	// if err := http.ListenAndServe(wifiIP, nil); err != nil {
	// 	log.Fatal(err)
	// }
}

func connectHttpServer(){
//fs:= http.FileServer(http.Dir("./web") )


	handler := NewHandler()
	http.Handle("/",http.FileServer(http.Dir("./web") ))

	http.HandleFunc("/ws",handler.serveWS)
	http.HandleFunc("/login",handler.JoinGameServer)
	http.HandleFunc("/api/click", handler.handleClickWS)
	http.HandleFunc("/api/pattern", controller.GetPattern)

	http.HandleFunc("/code", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./web/code.html")
	})

	http.HandleFunc("/multiplayer", func(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./web/multiplayer.html")
	})
}









// package main

// import (
// 	"colors/server"
// 	"encoding/json"
// 	"fmt"
// 	"log"
// 	"net/http"
// 	"sync"

// 	"github.com/gorilla/websocket"
// )

// var upgrader = websocket.Upgrader{
// 	CheckOrigin: func(r *http.Request) bool {
// 		return true
// 	},
// }

// var clients = make(map[*websocket.Conn]bool) // Keep track of connected clients
// var broadcast = make(chan Message)           // Channel for broadcasting messages to clients
// var mu sync.Mutex                            // Mutex for thread-safe access to game state

// // type BroadcastMessage struct {
// // 	Action	string `json:"action"`
// //     TopScorers    []server.Gamer `json:"topScorers"`
// //     OnlinePlayers []server.Gamer `json:"onlinePlayers"`
// // }

// type Player struct {
//     Conn      *websocket.Conn // The player's WebSocket connection
//     UserName  []string          // The player's username
// }

// var onlinePlayers = make(map[*websocket.Conn]string) // To hold connected players
// var onlinePlayersMutex sync.RWMutex

// type Message struct {
// 	Action           string            `json:"action"`
// 	ButtonClick      *server.ButtonClick `json:"buttonClick"`
// 	Score            int               `json:"score"`
// 	IsLocked         bool              `json:"isLocked"`
// 	FromPlayer 		bool				`json:"fromPlayer"`
// 	PlayerClicksLeft int               `json:"playerClicksLeft"`
// 	PlayerTurn 		[]server.ButtonClick `json:"playerTurn"`
// 	Pattern          []server.ButtonClick `json:"pattern"`
// 	User		*User					`json:"username"`
// 	OnlinePlayers 	[]server.Gamer		`json:"onlinePlayers"`
// }

// type User struct {
//     UserName []string //`json:"username"`
// }


// var game = &server.GameState{
// 	Pattern:          make([]server.ButtonClick, 0),
// 	PlayerTurn:       make([]server.ButtonClick, 0),
// 	IsLocked:         false,
// 	Score:            0,
// 	PlayerClicksLeft: 0,
// }

// func main() {
// 	fs := http.FileServer(http.Dir("./web"))
// 	http.Handle("/", fs)

// 	http.HandleFunc("/code", func(w http.ResponseWriter, r *http.Request) {
// 		http.ServeFile(w, r, "./web/code.html")
// 	})
// 	http.HandleFunc("/multiplayer", func(w http.ResponseWriter, r *http.Request) {
// 		http.ServeFile(w, r, "./web/multiplayer.html")
// 	})
	
// 	http.HandleFunc("/api/login", server.Login)

// 	http.HandleFunc("/api/click", handleClick)
//  	http.HandleFunc("/api/lock", handleLock)
// 	// http.HandleFunc("/api/unlock", handleUnlock)
// 	http.HandleFunc("/api/pattern", server.GetPattern)
// 	http.HandleFunc("/api/reset", handleReset)
	

// 	http.HandleFunc("/ws", handleConnections) // WebSocket route

// 	// Start listening for incoming messages and broadcasting them
// 	go handleMessages()

// 	wifiIP := "localhost:8080"
// 	log.Printf("Server starting on http://%s", wifiIP)
// 	if err := http.ListenAndServe(wifiIP, nil); err != nil {
// 		log.Fatal(err)
// 	}
// }

// // Handle WebSocket connections
// // func handleConnections(w http.ResponseWriter, r *http.Request) {
// //     ws, err := upgrader.Upgrade(w, r, nil)
// //     if err != nil {
// //         log.Printf("Failed to upgrade connection: %v", err)
// //         return
// //     }
    
// //     // Ensure connection cleanup
// //     defer func() {
// //         mu.Lock()
// //         delete(clients, ws)
// //         mu.Unlock()
// //         ws.Close()
// //     }()

// //     // Add client with thread safety
// //     mu.Lock()
// //     if len(clients) >= 100 { // Maximum connection limit
// //         mu.Unlock()
// //         ws.WriteJSON(Message{
// //             Action: "error",
// //             Score: -1,
// //             IsLocked: false,
// //             FromPlayer: false,
// //             PlayerClicksLeft: 0,
// //             Pattern: nil,
// //         })
// //         return
// //     }
// //     clients[ws] = true
// //     mu.Unlock()

// //     // Notify other clients about new connection
// //     broadcast <- Message{
// //         Action: "playerJoined",
// //         Score: game.Score,
// //         IsLocked: game.IsLocked,
// //         PlayerClicksLeft: game.PlayerClicksLeft,
// //     }

// //     for {
// //         var msg Message
// //         err := ws.ReadJSON(&msg)
// //         if err != nil {
// //             if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
// //                 log.Printf("WebSocket error: %v", err)
// //             }
// //             break
// //         }

// //         mu.Lock()
// //         if game == nil {
// //             mu.Unlock()
// //             log.Println("Game state is nil!")
// //             ws.WriteJSON(Message{
// //                 Action: "error",
// //                 Score: -1,
// //             })
// //             break
// //         }

// //         // Handle different actions received from clients
// //         switch msg.Action {
// //         case "click":
// //             if msg.ButtonClick == nil {
// //                 ws.WriteJSON(Message{
// //                     Action: "error",
// //                     Score: -1,
// //                 })
// //                 mu.Unlock()
// //                 continue
// //             }
// //             handleClickWS(msg.ButtonClick)
// //         case "lock":
// //             handleLockWS()
// //         case "reset":
// //             handleResetWS()
// //         default:
// //             log.Printf("Unknown action received: %s", msg.Action)
// //             mu.Unlock()
// //             continue
// //         }
// //         mu.Unlock()

// //         // Broadcast updated game state
// //         broadcast <- Message{
// //             Action:           "update",
// //             Score:            game.Score,
// //             IsLocked:         game.IsLocked,
// //             FromPlayer:       msg.ButtonClick.FromPlayer,
// //             PlayerClicksLeft: game.PlayerClicksLeft,
// //             Pattern:          game.Pattern,
// //         }
// //     }
// // }

// func handleConnections(w http.ResponseWriter, r *http.Request) {
	
// 	ws, err := upgrader.Upgrade(w, r, nil)
// 	if err != nil {
// 		log.Fatal(err)
// 	}
// 	defer ws.Close()

// 	clients[ws] = true
	
// 	for {
// 		var msg Message
// 		err := ws.ReadJSON(&msg)
// 		if err != nil {
// 			log.Printf("Error: %v", err)
// 			delete(clients, ws)
// 			//broadcastOnlinePlayers()
// 			break
// 		}
// 		if game == nil {
//             log.Println("Game state is nil!")
//             break
//         }
		

// 		// Handle different actions received from clients
// 		switch msg.Action {
// 		case "login":
  
//             onlinePlayersMutex.RLock()
// 			onlinePlayers[ws]= msg.User.UserName[0]
//             onlinePlayersMutex.RUnlock()

//             // Broadcast updated online players
//             broadcastOnlinePlayers()
// 		case "click":
// 			handleClickWS(msg.ButtonClick)
// 		case "lock":
// 			handleLockWS()
// 		case "reset":
// 			handleResetWS()
// 		}

// 		// Broadcast updated game state
// 		broadcast <- Message{
// 			Action:           "update",
// 			Score:            game.Score,
// 			IsLocked:         game.IsLocked,
// 			FromPlayer:       msg.ButtonClick.FromPlayer,
// 			PlayerClicksLeft: game.PlayerClicksLeft,
// 			Pattern:          game.Pattern,
// 		}

// 		fmt.Print(msg);
// 	}
// }

// func broadcastOnlinePlayers() {
//     onlinePlayersMutex.RLock()
//     defer onlinePlayersMutex.RUnlock()

//     players := make([]server.Gamer, 0, len(onlinePlayers))
//     for _, username := range onlinePlayers {
//         players = append(players, server.Gamer{
// 			UserName: username,
// 			TopScore: 0,
// 		})
//     }

//     // Broadcast to all connected clients
//     for conn := range onlinePlayers {
//         err := conn.WriteJSON(Message{
//             Action:         "updateOnlinePlayers",
//             OnlinePlayers: players,
//         })
//         if err != nil {
//             log.Printf("Error broadcasting online players: %v", err)
//         }
//     }
// }

// func handleClickWS(click *server.ButtonClick) {
// 	mu.Lock()
// 	defer mu.Unlock()
	
// 	log.Print(click.FromPlayer)
// 	if !click.FromPlayer {
// 		game.Pattern = append(game.Pattern, *click)
// 		game.PlayerClicksLeft++
// 	}
// 	if click.FromPlayer && game.IsLocked {
// 		game.PlayerTurn = append(game.PlayerTurn, *click)
// 		game.PlayerClicksLeft--

// 		if len(game.PlayerTurn) == len(game.Pattern) {
// 			matches := true
// 			for i := range game.PlayerTurn {
// 				if game.PlayerTurn[i].Id != game.Pattern[i].Id {
// 					matches = false
// 					break
// 				}
// 			}

// 			if matches && len(game.Pattern) >= 3 {
// 				game.Score += calculateScore(len(game.Pattern))
// 			}

// 			game.Pattern = make([]server.ButtonClick, 0)
// 			game.PlayerTurn = make([]server.ButtonClick, 0)
// 			game.IsLocked = false
// 		}
// 	}
// }

// func handleLockWS() {
//     mu.Lock()
//     defer mu.Unlock()

//     log.Printf("Game state before locking: %+v", game)

//     if game == nil {
//         log.Println("Game object is nil")
//         return
//     }

//     if len(game.Pattern) < 3 {
//         log.Println("Pattern length is too short")
//         return
//     }

//     game.IsLocked = true
//     log.Println("Game is now locked")

//     if game.PlayerTurn == nil {
//         log.Println("Initializing PlayerTurn slice")
//         game.PlayerTurn = make([]server.ButtonClick, 0)
//     } else {
//         log.Println("PlayerTurn slice already initialized")
//     }

//     game.PlayerTurn = make([]server.ButtonClick, 0)
// }


// func handleResetWS() {
// 	mu.Lock()
// 	defer mu.Unlock()
//    // Reset the game state
//    game.Pattern = make([]server.ButtonClick, 0)
//    game.PlayerTurn = make([]server.ButtonClick, 0)
//    game.IsLocked = false
//    game.Score = 0
//    game.PlayerClicksLeft = 0

//    // Create a new Message with the updated game state
//    msg := Message{
// 	   Pattern:          game.Pattern,
// 	   PlayerTurn:       game.PlayerTurn,
// 	   IsLocked:         game.IsLocked,
// 	   Score:            game.Score,
// 	   PlayerClicksLeft: game.PlayerClicksLeft,
//    }

//    // Send the message to tTopScorehe broadcast channel
//    broadcast <- msg
// }

// // Broadcast messages to all connected clients
// func handleMessages() {
// 	for {
// 		msg := <-broadcast
// 		for client := range clients {
// 			err := client.WriteJSON(msg)
// 			if err != nil {
// 				log.Printf("Error: %v", err)
// 				client.Close()
// 				delete(clients, client)
// 			}
// 		}
// 	}

// 	// mu.Lock()
//     // defer mu.Unlock()

//     // // Prepare the message
//     // message := BroadcastMessage{
// 	// 	Action: "updatePlayerList",
//     //     //TopScorers:    []server.,
//     //     OnlinePlayers: onlinePlayers,
//     // }

//     // messageJSON, err := json.Marshal(message)
//     // if err != nil {
//     //     log.Println("Error marshalling broadcast message:", err)
//     //     return
//     // }

//     // // Broadcast to all clients
//     // for client := range clients {
//     //     err := client.WriteMessage(websocket.TextMessage, messageJSON)
//     //     if err != nil {
//     //         log.Printf("Error sending message to client: %v", err)
//     //         client.Close()
//     //         delete(clients, client)
//     //     }
//     // }

// }

// func calculateScore(patternLength int) int {
// 	score := 10
// 	if patternLength >= 5 {
// 		score += 20
// 	}
// 	if patternLength >= 8 {
// 		score += 40
// 	}
// 	if patternLength >= 10 {
// 		score += 80
// 	}
// 	return score
// }


// func handleClick(w http.ResponseWriter, r *http.Request) {

// 	if r.Method != http.MethodPost {
// 		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
// 		return
// 	}

// 	var click server.ButtonClick
// 	if err := json.NewDecoder(r.Body).Decode(&click); err != nil {
// 		http.Error(w, err.Error(), http.StatusBadRequest)
// 		return
// 	}

// 	log.Print(click.FromPlayer);
// 	game.Mu.Lock()
// 	defer game.Mu.Unlock()
// 	if !click.FromPlayer {
// 		// This adds to the pattern if not the player's turn and game isn't locked
// 		game.Pattern = append(game.Pattern, click)
// 		game.PlayerClicksLeft ++
// 		log.Print(game.PlayerClicksLeft)
// 		log.Printf("Added to pattern - Color: %s, Id: %d", click.Color, click.Id)
// 	}
// 	if click.FromPlayer && game.IsLocked {
// 		// Now it's the player's turn
		
// 		game.PlayerTurn = append(game.PlayerTurn, click)
		
// 			game.PlayerClicksLeft--
		
// 		log.Print(game.PlayerClicksLeft)
// 		log.Printf("Added to playerTurn - Color: %s, Id: %d", click.Color, click.Id)
	
// 		// Validate the player's sequence only after all inputs are in
// 		if len(game.PlayerTurn) == len(game.Pattern) {
			
// 			log.Println("Validating player's sequence...")
// 			matches := true
	
// 			// Compare each step in the sequence
// 			for i := range game.PlayerTurn {
// 				if game.PlayerTurn[i].Id != game.Pattern[i].Id {
// 					matches = false
// 					log.Printf("Mismatch at position %d: Expected Id %d, Got Id %d", i, game.Pattern[i].Id, game.PlayerTurn[i].Id)
// 					break
// 				}
// 			}
	
// 			// If the player matched the pattern, update the score
// 			if matches && len(game.Pattern) >= 3 {
// 				game.Score+=10
// 				if len(game.Pattern) >= 5{
// 					game.Score+=20
// 				}
// 				if len(game.Pattern) >= 8{
// 					game.Score+=40
// 				}
// 				if len(game.Pattern) >= 10{
// 					game.Score+=80
// 				}	
// 				log.Printf("Pattern matched! Score incremented to: %d", game.Score)
// 			}
// 			if (game.PlayerClicksLeft==0){
// 				game.IsLocked = false
// 			}
// 			game.Pattern = make([]server.ButtonClick, 0)
// 			game.PlayerTurn = make([]server.ButtonClick, 0)
			
// 		}
		
// 	}
	
// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(map[string]interface{}{
// 		"status":   "success",
// 		"score":    game.Score,
// 		"isLocked": game.IsLocked,
// 		"playerClicksLeft": game.PlayerClicksLeft,
// 	})
// }

// func handleLock(w http.ResponseWriter, r *http.Request) {

// 	if r.Method != http.MethodPost {
// 		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
// 		return
// 	}

// 	game.Mu.Lock()
// 	defer game.Mu.Unlock()

// 	if len(game.Pattern) < 3 {
// 		http.Error(w, "Pattern must be at least 3 clicks", http.StatusBadRequest)
// 		log.Printf("Must be at least 3!!!")
// 		return 
// 	}

// 	game.IsLocked = true
// 	log.Printf("LOCKED")
// 	game.PlayerTurn = make([]server.ButtonClick, 0)

// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(map[string]interface{}{
// 		"status": "success",
// 		"isLocked": game.IsLocked,
// 		"score": game.Score,
// 		"pattern": game.Pattern,

// 	})
// }

// // func handleUnlock(w http.ResponseWriter, r *http.Request) {
// // 	log.Printf("Unlocking...")
// // 	if r.Method != http.MethodPost {
// // 		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
// // 		return
// // 	}

// // 	game.mu.Lock()
// // 	defer game.mu.Unlock()

// // 	game.IsLocked = false
// // 	log.Printf("UNLOCKED")
// // 	game.Pattern = make([]ButtonClick, 0)
// // 	game.PlayerTurn = make([]ButtonClick, 0)
// // 	game.PlayerClicksLeft = 0

// // 	w.Header().Set("Content-Type", "application/json")
// // 	json.NewEncoder(w).Encode(map[string]interface{}{
// // 		"status": "success",
// // 		"isLocked": game.IsLocked,
// // 		"playerClicksLeft": game.PlayerClicksLeft,
// // 	})
// // }

// func handleReset(w http.ResponseWriter, r *http.Request) {

// 	if r.Method != http.MethodPost {
// 		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
// 		return
// 	}

// 	game.Mu.Lock()
// 	game.Pattern = make([]server.ButtonClick, 0)
// 	game.PlayerTurn = make([]server.ButtonClick, 0)
// 	game.IsLocked = false
// 	game.Score = 0
// 	game.PlayerClicksLeft = 0
// 	game.Mu.Unlock()

// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(map[string]interface{}{
// 		"status": "success",
// 		"score": game.Score,
// 		"playerClicksLeft": game.PlayerClicksLeft,

// 	})
// }

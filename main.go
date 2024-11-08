package main

import (
	"colors/controller"
	"log"
	"net/http"
)

func main(){
	connectHttpServer()
	port := ":8080"
	log.Printf("Started on %s", port)
	//log.Fatal(http.ListenAndServe(port, nil ))
	log.Fatal(http.ListenAndServeTLS(port, "game.crt", "game.key", nil ))

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

	http.HandleFunc("/multiplayer", func(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./web/multiplayer.html")
	})
}

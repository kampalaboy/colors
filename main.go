package main

import (
	"colors/controller"
	"log"
	"net/http"
)

func main(){
	connectHttpServer()
	//port := os.Getenv("PORT") 
	port := "8080"
	//port := "192.168.0.109:8080" // 192.168.43.54 
	log.Printf("Started on %s", port)
	//log.Fatal(http.ListenAndServe("0.0.0.0:"+port, nil ))
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

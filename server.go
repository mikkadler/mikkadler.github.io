package main

import (
	"fmt"
	"log"
	"net/http"
	"text/template"
)

const port = ":8080"

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/", Index)

	fileServer := http.FileServer(http.Dir("./assets"))
	mux.Handle("/assets/", http.StripPrefix("/assets", fileServer))

	fmt.Println("Starting server on http://localhost" + port)
	log.Fatal(http.ListenAndServe(port, mux))
}

func Index(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("index.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	//head := r.Header
	//fmt.Println("Cookie", head["Cookie"])

	err = tmpl.Execute(w, nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

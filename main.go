package main

import (
	"database/sql"
	"fmt"
	"github.com/alexedwards/scs/v2"
	_ "github.com/jackc/pgx/v4/stdlib"
	"html/template"
	"log"
	"net/http"
	"time"
)

var errordata ErrorData
var templates *template.Template
var session *scs.SessionManager
var db *sql.DB
var err error

func main() {
	errordata.LoginError = true
	db, err = sql.Open("pgx", fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname))
	if err != nil {
		log.Fatalf(fmt.Sprintf("Unable to connect: %v\n", err))
	}
	defer func(db *sql.DB) {
		err := db.Close()
		if err != nil {
			log.Fatalln(err)
		}
	}(db) // náhrada za defer db.Close()
	log.Println("Connected to database")

	session = scs.New()
	session.Lifetime = 24 * time.Hour

	templates = template.Must(template.ParseGlob("templates/*.gohtml"))

	err := http.ListenAndServe(":8080", session.LoadAndSave(Routes()))
	if err != nil {
		log.Fatalln(err)
	}
}

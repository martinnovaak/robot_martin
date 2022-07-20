package main

import (
	"encoding/json"
	"github.com/go-chi/chi/v5"
	"log"
	"net/http"
)

func postRemoveCommand(writer http.ResponseWriter, request *http.Request) {
	username := session.GetString(request.Context(), "username")
	if username == "" {
		http.Redirect(writer, request, "/login", 302)
		return
	}

	if removeCommand(chi.URLParam(request, "commandName")) {
		log.Println("Command deleted.")
	} else {
		log.Println("Command could not be deleted.")
	}
}

func getCommandHandler(writer http.ResponseWriter, request *http.Request) {
	username := session.GetString(request.Context(), "username")
	if username == "" {
		http.Redirect(writer, request, "/login", 302)
		return
	}

	err := templates.ExecuteTemplate(writer, "commands.gohtml", Data{
		Name:     username,
		Commands: getCommands(username),
	})
	if err != nil {
		log.Fatalln(err)
	}
}

func getLogoutHandler(w http.ResponseWriter, r *http.Request) {
	clearErrors()
	if session.GetString(r.Context(), "username") != "" {
		session.Remove(r.Context(), "username")
	}
	http.Redirect(w, r, "/login", 302)
}

func postCommandHandler(_ http.ResponseWriter, request *http.Request) {
	username := session.GetString(request.Context(), "username")
	if username == "" {
		return
	}

	var comm Command
	decoder := json.NewDecoder(request.Body)
	err := decoder.Decode(&comm)
	if err != nil {
		log.Fatalf("ERROR while decoding")
	}

	insertCommand(comm, username)

	log.Println("Inserted a command")
}

func postRegisterHandler(w http.ResponseWriter, r *http.Request) {
	clearErrors()
	err := r.ParseForm()
	if err != nil {
		log.Fatalln(err)
	}
	name := r.PostForm.Get("username")
	pswrd := r.PostForm.Get("password")
	email := r.PostForm.Get("email")

	if !checkRegisterData(name, pswrd, email) {
		http.Redirect(w, r, "/register", 302)
		return
	}
	session.Put(r.Context(), "username", name)

	insertNewUser(name, pswrd, email)

	http.Redirect(w, r, "/", 302)
}

func postLoginHandler(w http.ResponseWriter, r *http.Request) {
	clearErrors()
	err := r.ParseForm()
	if err != nil {
		log.Fatalln(err)
	}
	name := r.PostForm.Get("username")
	pswrd := r.PostForm.Get("password")

	pw := checkUser(name)

	if err != nil {
		errordata.LoginError = true
		errordata.UsernameError = "Zadané uživatelské jméno neexistuje."
		http.Redirect(w, r, "/login", 302)
		return
	}
	if pw != pswrd {
		errordata.LoginError = true
		errordata.PasswordError = "Zadané heslo není správné."
		errordata.Username = name
		http.Redirect(w, r, "/login", 302)
		return
	}

	session.Put(r.Context(), "username", name)
	http.Redirect(w, r, "/", 302)
}

func getRegisterHandler(w http.ResponseWriter, r *http.Request) {
	if session.GetString(r.Context(), "username") != "" {
		http.Redirect(w, r, "/", 302)
		return
	}

	errordata.Login = false
	err := templates.ExecuteTemplate(w, "login.gohtml", errordata)
	if err != nil {
		log.Fatalln(err)
	}
}

func getLoginHandler(w http.ResponseWriter, r *http.Request) {
	if session.GetString(r.Context(), "username") != "" {
		http.Redirect(w, r, "/", 302)
		return
	}

	errordata.Login = true
	err := templates.ExecuteTemplate(w, "login.gohtml", errordata)
	if err != nil {
		log.Fatalln(err)
	}
}

func getMainHandler(w http.ResponseWriter, request *http.Request) {
	username := session.GetString(request.Context(), "username")

	levels := getLevels()
	o := getObstacles(len(levels))
	comm := getCommands(username)

	err := templates.ExecuteTemplate(w, "robot.gohtml", Data{
		Name:      username,
		Levels:    levels,
		Commands:  comm,
		Obstacles: o,
	})
	if err != nil {
		log.Fatalln(err)
	}
}
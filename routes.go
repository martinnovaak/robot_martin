package main

import (
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"net/http"
)

func Routes() *chi.Mux {
	router := chi.NewRouter()
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)
	router.Get("/", getMainHandler)
	router.Get("/login", getLoginHandler)
	router.Get("/register", getRegisterHandler)
	router.Get("/logout", getLogoutHandler)
	router.Post("/login", postLoginHandler)
	router.Post("/register", postRegisterHandler)
	router.Post("/commands", postCommandHandler)
	router.Get("/commands", getCommandHandler)
	router.Post("/removeCommand/{commandName}", postRemoveCommand)

	fileServer := http.FileServer(http.Dir("./static/"))
	router.Handle("/static/*", http.StripPrefix("/static/", fileServer))

	return router
}

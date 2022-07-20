package main

import (
	"log"
)

func getCommands(username string) []Command {
	comm := []Command{}
	var command, command_name, html string
	query := `select command, command_name, html from commands where username = $1`
	rows, _ := db.Query(query, username)
	for rows.Next() {
		err := rows.Scan(&command, &command_name, &html)
		if err != nil {
			log.Println(err)
		}
		comm = append(comm, Command{command, command_name, html})
	}
	return comm
}

func removeCommand(commandName string) bool {
	query := `delete from commands where command_name = $1`
	_, err = db.Exec(query, commandName)
	if err != nil {
		log.Fatal(err)
		return false
	}
	return true
}

func insertCommand(comm Command, username string) {
	query := `insert into commands (command, command_name, html, username) values ($1, $2, $3, $4)`
	_, err = db.Exec(query, comm.Comm, comm.NameOfCommand, comm.Html, username)
	if err != nil {
		log.Fatal(err)
	}
}

func insertNewUser(name, pswrd, email string) {
	query := `insert into users (username, password, email) values ($1, $2, $3)`
	_, err = db.Exec(query, name, pswrd, email)
	if err != nil {
		log.Fatal(err)
	}
}

func checkUser(username string) string {
	var pw string
	query := `select password from users where username = $1`

	row := db.QueryRow(query, username)
	err = row.Scan(&pw)
	return pw
}

func getLevels() []Level {
	levels := []Level{}
	var r, s int
	query := `select rows, columns from levels`
	rows, _ := db.Query(query)

	i := 1
	for rows.Next() {
		err := rows.Scan(&r, &s)
		if err != nil {
			log.Println(err)
		}
		levels = append(levels, Level{r, s, i})
		i++
	}
	return levels
}

func getObstacles(length int) []Obstacle {
	var o []Obstacle
	for i := 1; i <= length; i++ {
		query := `select X, Y from obstacles where level = $1`
		rows, _ := db.Query(query, i)
		var X, Y []int

		for rows.Next() {
			var x, y int
			err := rows.Scan(&x, &y)
			if err != nil {
				log.Println(err)
			}
			X = append(X, x)
			Y = append(Y, y)
		}
		o = append(o, Obstacle{X, Y})
	}
	return o
}

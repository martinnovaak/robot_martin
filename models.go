package main

type ErrorData struct {
	Username      string
	Email         string
	UsernameError string
	PasswordError string
	EmailError    string
	LoginError    bool
	Login         bool
}

type Obstacle struct {
	X []int
	Y []int
}
type Command struct {
	Comm          string `json:"command"`
	NameOfCommand string `json:"name"`
	Html          string `json:"html"`
}

type Level struct {
	Rows int
	Cols int
	ID   int
}

type Data struct {
	Name      string
	Obstacles []Obstacle
	Commands  []Command
	Levels    []Level
}

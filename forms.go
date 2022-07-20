package main

import (
	"log"
	"regexp"
)

func checkRegisterData(name, pswrd, email string) bool {
	ok := true
	if len(name) < 3 {
		errordata.UsernameError = "Uživatelské jméno musí být delší jak 3 znaky"
		ok = false
	}

	if len(pswrd) < 5 {
		errordata.PasswordError = "Heslo musí být alespoň 5 znaků"
		ok = false
	}

	if email != "" {
		log.Println(email)
		emailRegex := regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`)
		if !emailRegex.MatchString(email) {
			errordata.EmailError = "Nebyla zadána korektní emailová adresa"
			ok = false
		}
	} else {
		errordata.EmailError = "Nebyla zadána emailová adresa"
		ok = false
	}

	checkUser(name)
	if err == nil {
		errordata.UsernameError = "Zadané uživatelské jméno již existuje"
		ok = false
	}

	log.Println(ok)
	return ok
}

func clearErrors() {
	errordata.Username = ""
	errordata.Email = ""
	errordata.UsernameError = ""
	errordata.PasswordError = ""
	errordata.EmailError = ""
}

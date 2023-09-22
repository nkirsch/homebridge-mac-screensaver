package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
)

type RequestBody struct {
	Password string `json:"password"`
}

func main() {
	startServer()
}

func startServer() {
	http.HandleFunc("/", handleRequest)
	port := 19820
	fmt.Printf("Server listening on port %d...\n", port)
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
	if err != nil {
		fmt.Println("Error:", err)
	}
}

func handleRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost && r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if r.Method == http.MethodPost {

		var requestBody RequestBody
		decoder := json.NewDecoder(r.Body)
		err := decoder.Decode(&requestBody)
		if err != nil {
			http.Error(w, "Invalid JSON format", http.StatusBadRequest)
			return
		}

		if requestBody.Password != "nightnight" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// If the password is correct, execute the command
		cmd := exec.Command("pmset", "displaysleepnow")
		err = cmd.Run()
		if err != nil {
			http.Error(w, "Error executing command", http.StatusInternalServerError)
			return
		}

		fmt.Fprintf(w, "Command executed successfully: pmset displaysleepnow\n")
	}

	if r.Method == http.MethodGet {
		isRunning := false // Change this to your actual logic

		// Create a response JSON object
		response := struct {
			IsRunning bool `json:"isRunning"`
		}{
			IsRunning: isRunning,
		}

		// Encode the response as JSON
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

}

func stopDaemon() {
	// Implement the code to stop the daemon here (e.g., by PID)
	fmt.Println("Stopping daemon...")
	// Add code to stop the daemon, for example, by sending a signal to the process.
}

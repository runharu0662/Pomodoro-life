package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type TimerStatus struct {
	Status    string    `json:"status"`
	StartTime time.Time `json:"startTime,omitempty"`
	Elapsed   string    `json:"elapsed,omitempty"`
}

var currentStatus = TimerStatus{Status: "stopped"}

func main() {
	http.HandleFunc("/api/timer/start", startTimer)
	http.HandleFunc("/api/timer/stop", stopTimer)
	http.HandleFunc("/api/timer/status", getStatus)

	fmt.Println("Backend server is running on :8080")
	http.ListenAndServe(":8080", nil)
}

func startTimer(w http.ResponseWriter, r *http.Request) {
	if currentStatus.Status != "running" {
		currentStatus.Status = "running"
		currentStatus.StartTime = time.Now()
	}
	json.NewEncoder(w).Encode(currentStatus)
}

func stopTimer(w http.ResponseWriter, r *http.Request) {
	if currentStatus.Status == "running" {
		currentStatus.Status = "stopped"
		currentStatus.Elapsed = time.Since(currentStatus.StartTime).String()
	}
	json.NewEncoder(w).Encode(currentStatus)
}

func getStatus(w http.ResponseWriter, r *http.Request) {
	if currentStatus.Status == "running" {
		currentStatus.Elapsed = time.Since(currentStatus.StartTime).String()
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(currentStatus)
}

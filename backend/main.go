package main

import (
	"encoding/json"
	"net/http"
	"sync"
)

type DoneRequest struct {
	Done bool `json:"done"`
}

type CountResponse struct {
	Count int `json:"count"`
}

var (
	count int
	mu    sync.Mutex
)

func doneHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
		return
	}

	var req DoneRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	mu.Lock()
	defer mu.Unlock()

	if req.Done {
		count++
	}

	res := CountResponse{Count: count}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func countHandler(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	defer mu.Unlock()

	res := CountResponse{Count: count}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func main() {
	http.HandleFunc("/api/done", doneHandler)
	http.HandleFunc("/api/count", countHandler)

	http.ListenAndServe(":8080", nil)
}

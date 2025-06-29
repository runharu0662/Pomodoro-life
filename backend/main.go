package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
)

var (
	sessionCount int
	mutex        sync.Mutex
)

func main() {
	http.HandleFunc("/api/count", cors(handleCount))

	log.Println("Server started at :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// ✅ CORS Middleware
func cors(h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		if r.Method == "OPTIONS" {
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			w.WriteHeader(http.StatusOK)
			return
		}
		h(w, r)
	}
}

// ✅ /api/count handler
func handleCount(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		mutex.Lock()
		count := sessionCount
		mutex.Unlock()

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]int{"count": count})

	case http.MethodPost:
		mutex.Lock()
		sessionCount++
		log.Println("sessionCount incremented:", sessionCount) // ログで確認
		mutex.Unlock()

		w.WriteHeader(http.StatusNoContent)

	default:
		http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
	}
}

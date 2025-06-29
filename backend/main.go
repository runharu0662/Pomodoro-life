package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	_ "github.com/lib/pq"
)

var db *sql.DB

func main() {
	var err error

	// ✅ PostgreSQL接続設定
	db, err = sql.Open("postgres", "host=localhost port=5432 user=youruser password=yourpass dbname=yourdb sslmode=disable")
	if err != nil {
		log.Fatal(err)
	}

	// ✅ APIルーティング（CORS対応込み）
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

// ✅ /api/count ハンドラー
func handleCount(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		var count int
		err := db.QueryRow("SELECT count FROM pomodoro_count WHERE id = 1").Scan(&count)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]int{"count": count})

	case http.MethodPost:
		_, err := db.Exec("UPDATE pomodoro_count SET count = count + 1 WHERE id = 1")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)

	default:
		http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
	}
}

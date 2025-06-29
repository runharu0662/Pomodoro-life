package main

import (
	"database/sql"  // データベース操作用
	"encoding/json" // JSONデータのエンコード/デコード用
	"fmt"           // フォーマットされたI/O (ログ出力など)
	"log"           // ログ記録用
	"net/http"      // HTTPサーバー機能用
	"time"          // 完了時刻の記録などに使用

	"github.com/gorilla/mux" // パスパラメータを含むルーティング用
	_ "github.com/lib/pq"    // PostgreSQLデータベースドライバー (直接使わないが、ドライバ登録のために必要)
)

// Task はタスクのIDとポモドーロ完了回数のみを扱う簡略化された構造体です
// フロントエンドから受け取るタスクIDと、データベースで管理する完了カウントに対応します
// 
type Task struct {
	ID            string `json:"id"`            // タスクの一意なID
	PomodoroCount int    `json:"pomodoroCount"` // このタスクで完了したポモドーロセッションの数
}

// グローバル変数としてデータベース接続のみを保持します
// これにより、アプリケーション全体でデータベースにアクセスできます
var db *sql.DB

// initDB 関数はデータベースに接続し、必要な 'tasks' テーブルを作成します
// サーバー起動時に一度だけ実行され、データベースの準備をします
func initDB() {
	var err error
	// PostgreSQL接続文字列
	connStr := "user=pomodoro_user password=123 dbname=pomodoro_db sslmode=disable"
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}
	fmt.Println("Successfully connected to PostgreSQL!")

	createTableSQL := `
	CREATE TABLE IF NOT EXISTS tasks (
		id VARCHAR(255) PRIMARY KEY,
		pomodoro_count INTEGER NOT NULL DEFAULT 0
	);`
	_, err = db.Exec(createTableSQL)
	if err != nil {
		log.Fatalf("Failed to create tasks table: %v", err)
	}
	fmt.Println("Tasks table ensured. (Simplified for PomodoroCount tracking)")
}

func main() {
	initDB() // アプリケーション起動時にデータベース接続を初期化します

	router := mux.NewRouter() // gorilla/mux ルーターを作成します

	router.HandleFunc("/api/tasks/{id}/complete-pomodoro", handlePomodoroComplete).Methods("POST")

	fmt.Println("Backend server is running on :8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}

func handlePomodoroComplete(w http.ResponseWriter, r *http.Request) {
	// レスポンスのContent-TypeをJSONに設定します
	w.Header().Set("Content-Type", "application/json")

	// POSTメソッド以外のリクエストは許可しません
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// gorilla/mux を使用して、URLパスからタスクIDを取得します
	// 例: /api/tasks/YOUR_TASK_ID/complete-pomodoro から 'YOUR_TASK_ID' を取得
	vars := mux.Vars(r)
	taskID := vars["id"]

	// タスクIDが提供されているか確認します
	if taskID == "" {
		http.Error(w, "Task ID is required in the URL path.", http.StatusBadRequest)
		return
	}

	// データベースから指定されたタスクIDの現在のポモドーロカウントを取得します
	var currentCount int
	err := db.QueryRow("SELECT pomodoro_count FROM tasks WHERE id = $1", taskID).Scan(&currentCount)

	// SQLエラーの種類に応じて処理を分岐します
	if err == sql.ErrNoRows {
		// もしタスクがデータベースに存在しない場合、新しいタスクとして登録し、カウントを1に設定します
		// これは、フロントエンドが新しいタスクIDを送信してきた場合の簡易的な対応です
		_, err = db.Exec(
			"INSERT INTO tasks (id, pomodoro_count) VALUES ($1, $2)",
			taskID, 1,
		)
		if err != nil {
			log.Printf("Error creating new task '%s' in DB: %v", taskID, err)
			http.Error(w, "Failed to create new task and increment count in database", http.StatusInternalServerError)
			return
		}
		currentCount = 1 // 新規作成したので、現在のカウントは1です
		log.Printf("New task '%s' created with pomodoro count: %d", taskID, currentCount)
	} else if err != nil {
		// SELECTクエリでその他のデータベースエラーが発生した場合
		log.Printf("Error querying task '%s' from DB: %v", taskID, err)
		http.Error(w, "Failed to retrieve task from database", http.StatusInternalServerError)
		return
	} else {
		// タスクがデータベースに存在する場合、ポモドーロカウントを1インクリメントします
		newCount := currentCount + 1
		_, err = db.Exec(
			"UPDATE tasks SET pomodoro_count = $1 WHERE id = $2",
			newCount, taskID,
		)
		if err != nil {
			log.Printf("Error updating task '%s' pomodoro count in DB: %v", taskID, err)
			http.Error(w, "Failed to update task in database", http.StatusInternalServerError)
			return
		}
		currentCount = newCount
		log.Printf("Task '%s' pomodoro count incremented to: %d", taskID, currentCount)
	}

	// 処理が成功した場合、JSON形式の成功レスポンスをクライアントに返します
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":     "Pomodoro count incremented successfully", // 成功メッセージ
		"id":          taskID,                                    // インクリメントしたタスクのID
		"newCount":    currentCount,                              // 更新後のポモドーロカウント
		"completedAt": time.Now(),                                // 処理が完了した日時
	})
}

import { useState, useEffect } from 'react'
import Timer from './Timer'

function App() {
  const [inputValue, setInputValue] = useState(25)
  const [breakValue, setBreakValue] = useState(5)
  const [showTimer, setShowTimer] = useState(false)
  const [startImmediately, setStartImmediately] = useState(false)
  const [successCount, setSuccessCount] = useState(0)

  useEffect(() => {
    fetch('http://100.112.16.126/api/count')
      .then(res => res.json())
      .then(data => setSuccessCount(data.count))
      .catch(err => console.error('取得エラー:', err))
  }, [])


  const handleStart = () => {
    setStartImmediately(true)  // ← このフラグでTimerに「すぐ開始して」と伝える
    setShowTimer(true)
  }

  const handleSuccessRecorded = () => {
    fetch('http://100.112.16.126/api/count')
      .then(res => res.json())
      .then(data => setSuccessCount(data.count))
      .catch(err => console.error('カウント再取得エラー:', err))
  }


  return (
    <div>
      <h1>Pomodoro life</h1>
      <div className="setup-form">
        {!showTimer && (
          <>
            <div className="TimeInput">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(Number(e.target.value))}
                placeholder="作業時間（分）"
              />
              <br />
              <input
                type="number"
                value={breakValue}
                onChange={(e) => setBreakValue(Number(e.target.value))}
                placeholder="休憩時間（分）"
              />
            </div>
            <br />
            <div className="startbtn">
              <button onClick={handleStart}>開始</button>
            </div>
          </>
        )}
      </div>

      {showTimer && (
        <Timer
          initialMinutes={inputValue}
          breakMinutes={breakValue}
          autoStart={startImmediately}               // ← 渡す
          onSuccessRecorded={handleSuccessRecorded}
          onComplete={() => {
            setShowTimer(false)
            setStartImmediately(false)              // 初期化も忘れずに！
          }}
          onAbort={() => {
            setShowTimer(false)
            setStartImmediately(false)
          }}
        />
      )}
    </div>
  )
}

export default App

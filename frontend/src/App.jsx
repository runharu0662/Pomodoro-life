import { useState } from 'react'
import Timer from './Timer'

function App() {
  const [inputValue, setInputValue] = useState(25) // 入力された分数
  const [start, setStart] = useState(false)        // タイマーを表示するかどうか
  const [isRunning, setIsRunning] = useState(false)

  const handleStart = () => {
    setStart(true) // ボタンを押したらタイマーを表示する
  }

  return (
    <div>
      <h1>タイマーテスト</h1>

      <input
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(Number(e.target.value))}
        placeholder="時間(分)を入力してください"
      />



      <Timer initialMinutes={inputValue} isRunning={isRunning} />
    </div>
  )
}

export default App
//<button onClick={handleStart}>開始</button>
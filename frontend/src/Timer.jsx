import { useState, useEffect } from 'react'
/*保管場所

const [praise, setPraise] = useState(false)       // 褒め表示中かどうか

*/
function Timer({ initialMinutes = 25 }) {
    const [time, setTime] = useState(initialMinutes * 60)       // 残り時間（秒）
    const [isRunning, setIsRunning] = useState(false) // タイマー動作中かどうか
    const [inputValue, setInputValue] = useState(25) // 入力された分数

    useEffect(() => {
        if (isRunning && time > 0) {
            const timerId = setInterval(() => {
                setTime(prev => prev - 1)
            }, 1000)

            return () => clearInterval(timerId)  // クリーンアップ
        }
    }, [isRunning, time])

    useEffect(() => {
        setTime(initialMinutes * 60)
        setIsRunning(false)
    }, [initialMinutes])


    const formatTime = (seconds) => {
        const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
        const secs = String(seconds % 60).padStart(2, '0')
        return `${minutes}:${secs}`
    }

    const handleClick = () => {
        setIsRunning(prev => !prev)
    }

    return (
        <div>
            <div className="TimerDisplay">
                <h2>{formatTime(time)}</h2>
            </div>

            <div className="timerbtn">
                <button onClick={handleClick}>
                    {isRunning ? "停止" : "開始"}
                </button>
            </div >
        </div>
    )
}
export default Timer

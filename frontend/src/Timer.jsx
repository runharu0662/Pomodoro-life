import { useState, useEffect } from 'react'
/*保管場所

const [praise, setPraise] = useState(false)       // 褒め表示中かどうか

*/
function Timer(props) {
    const {
        initialMinutes = 25,
        breakMinutes = 5,
        autoStart = false,
        onComplete,
        onAbort,
        onSuccessRecorded,
        successCount = 0,
    } = props
    const [time, setTime] = useState(import.meta.env.DEV ? 5 : initialMinutes * 60)       // 残り時間（秒）
    const [isRunning, setIsRunning] = useState(false) // タイマー動作中かどうか
    const [isWorking, setIsWorking] = useState(true)
    const [isWaitingToStartBreak, setIsWaitingToStartBreak] = useState(false)
    const [breakDuration, setBreakDuration] = useState(breakMinutes)
    const totalDots = 24
    const elapsedRatio = 1 - time / (isWorking ? initialMinutes * 60 : breakMinutes * 60)
    const litDots = Math.floor(elapsedRatio * totalDots)



    useEffect(() => {
        if (autoStart) {
            setIsRunning(true)
        }
    }, [autoStart])


    useEffect(() => {
        if (isRunning && time > 0) {
            const timerId = setInterval(() => {
                setTime(prev => prev - 1)
            }, 1000)

            return () => clearInterval(timerId)  // クリーンアップ
        }
    }, [isRunning, time])

    useEffect(() => {
        if (import.meta.env.PROD) {
            setTime(initialMinutes * 60)
        } else {
            setTime(5) // DEV用（開発）
        }

        if (autoStart) {
            setIsRunning(true)
        } else {
            setIsRunning(false)
        }
    }, [initialMinutes, autoStart])


    useEffect(() => {
        if (time === 0 && isRunning) {
            new Audio('/sound/Censor_Bleep-Synth03-1(Short).mp3').play()
            setIsRunning(false)

            if (isWorking) {
                // 作業終了時：休憩待ちに切り替える
                setIsWaitingToStartBreak(true)
            } else {
                // 休憩終了時：ポモドーロ完了としてAppに通知
                if (onComplete) onComplete()
            }
        }
    }, [time, isRunning, isWorking])


    const formatTime = (seconds) => {
        const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
        const secs = String(seconds % 60).padStart(2, '0')
        return `${minutes}:${secs}`
    }

    const handleClick = () => {
        setIsRunning(prev => !prev)
    }

    const startBreak = () => {
        fetch('http://100.112.16.126/api/done', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ done: true })
        }).then(() => {
            if (onSuccessRecorded) onSuccessRecorded()
        }).catch((error) => {
            console.error('送信エラー:', error)
        })


        setTime(import.meta.env.DEV ? 5 : breakDuration * 60)
        setIsWorking(false)
        setIsRunning(true)
        setIsWaitingToStartBreak(false)
    }
    const handleGiveUp = () => {
        if (isWorking) {
            setTime(initialMinutes * 60)
        } else {
            setTime(breakDuration * 60)
        }
        setIsRunning(false)
        if (onAbort) onAbort()
    }


    return (
        <div>
            <div className="success-counter">
                成功回数: {props.successCount}
            </div>

            <div className="dot-ring">
                {Array.from({ length: totalDots }).map((_, i) => {
                    const angle = (360 / totalDots) * i
                    const isLit = i < litDots
                    return (
                        <div
                            key={i}
                            className={`dot ${isLit ? 'lit' : ''}`}
                            style={{
                                transform: `rotate(${angle}deg) translateY(-90px)` // ← -100px から -90px に
                            }}
                        />
                    )
                })}
                <div className="time-label">
                    {formatTime(time)}
                </div>
            </div>


            <div className="timerbtn">
                {isWorking && !isWaitingToStartBreak && (
                    < button onClick={handleClick}>
                        {isRunning ? "停止" : "開始"}
                    </button>
                )}
                {!isWaitingToStartBreak && isRunning && (
                    <button onClick={handleGiveUp}>あきらめる</button>
                )}

                {isWaitingToStartBreak && (
                    <button onClick={startBreak}>休憩を開始</button>
                )}
            </div >

        </div >
    )
}
export default Timer

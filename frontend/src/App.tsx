/** @jsxImportSource @emotion/react */
import { useState, useEffect } from "react";
import { css } from "@emotion/react";
import useSound from "use-sound";
import Button from "./components/Button";
import InputField from "./components/InputField";
import beepSound from "./sounds/beep.mp3";

// ✅ API_URL を直書き
const API_URL = "http://100.112.16.126";

const appStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-top: 50px;
`;

const timerStyle = css`
  font-size: 48px;
  margin: 20px;
`;

const buttonContainerStyle = css`
  margin: 20px;
`;

const countStyle = css`
  margin: 20px;
  font-size: 24px;
`;

const App = () => {
  const [workMinutes, setWorkMinutes] = useState("25");
  const [breakMinutes, setBreakMinutes] = useState("5");
  const [minutes, setMinutes] = useState(parseInt(workMinutes));
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [play] = useSound(beepSound, { volume: 0.5 });

  // ✅ 1. セッション回数取得
  const fetchCount = async () => {
    try {
      const res = await fetch(`${API_URL}/api/count`);
      console.log("GET /api/count Status:", res.status); // デバッグ用
      const data = await res.json();
      setSessionCount(data.count);
    } catch (err) {
      console.error("Error fetching count:", err);
    }
  };

  // ✅ 2. セッション記録（回数+1更新）
  const recordSession = async () => {
    console.log("recordSession called"); // デバッグ用
    try {
      const res = await fetch(`${API_URL}/api/count`, {
        method: "POST",
      });
      console.log("POST /api/count Status:", res.status); // デバッグ用
      fetchCount(); // 更新後に最新回数取得
    } catch (err) {
      console.error("Error recording session:", err);
    }
  };

  // ✅ 3. 初回マウント時に回数取得
  useEffect(() => {
    fetchCount();
  }, []);

  // ✅ 4. タイマー処理
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            play();
            if (isBreak) {
              setMinutes(parseInt(workMinutes));
              setIsBreak(false);
            } else {
              setMinutes(parseInt(breakMinutes));
              setIsBreak(true);

              // ✅ 一巡完了時に回数記録
              recordSession();
            }
            setSeconds(0);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes, isBreak, workMinutes, breakMinutes, play]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(parseInt(workMinutes));
    setSeconds(0);
  };

  const handleWorkMinutesChange = (e) => {
    setWorkMinutes(e.target.value);
    if (!isActive && !isBreak) {
      setMinutes(parseInt(e.target.value));
    }
  };

  const handleBreakMinutesChange = (e) => {
    setBreakMinutes(e.target.value);
    if (!isActive && isBreak) {
      setMinutes(parseInt(e.target.value));
    }
  };

  return (
    <div css={appStyle}>
      <h1>Pomodoro Timer</h1>
      <div css={timerStyle}>
        {minutes < 10 ? `0${minutes}` : minutes}:
        {seconds < 10 ? `0${seconds}` : seconds}
      </div>
      <div css={buttonContainerStyle}>
        <Button
          onClick={toggleTimer}
          disabled={false}
          text={isActive ? "Pause" : "Start"}
        />
        <Button onClick={resetTimer} disabled={false} text="Reset" />
      </div>
      <InputField
        label="Work Minutes:"
        value={workMinutes}
        onChange={handleWorkMinutesChange}
      />
      <InputField
        label="Break Minutes:"
        value={breakMinutes}
        onChange={handleBreakMinutesChange}
      />

      {/* ✅ 5. 完了回数表示 */}
      <div css={countStyle}>Completed Sessions: {sessionCount}</div>
    </div>
  );
};

export default App;

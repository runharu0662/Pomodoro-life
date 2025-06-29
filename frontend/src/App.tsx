/** @jsxImportSource @emotion/react */
import { useState, useEffect } from "react";
import { css } from "@emotion/react";
import useSound from "use-sound";
import Button from "./components/Button";
import InputField from "./components/InputField";
import beepSound from "./sounds/beep.mp3";

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

const App = () => {
  const [workMinutes, setWorkMinutes] = useState("25");
  const [breakMinutes, setBreakMinutes] = useState("5");
  const [minutes, setMinutes] = useState(parseInt(workMinutes));
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [play] = useSound(beepSound, { volume: 0.5 });

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
        <Button onClick={toggleTimer} disabled={false} text={isActive ? "Pause" : "Start"} />
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
    </div>
  );
};

export default App;
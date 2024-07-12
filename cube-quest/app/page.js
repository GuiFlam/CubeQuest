"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { randomScrambleForEvent } from "cubing/scramble";
import { useEffect, useState } from "react";

randomScrambleForEvent("333").then((scramble) => {
  console.log(scramble.toString());
});

export default function Home() {
  const [scramble, setScramble] = useState("");
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [times, setTimes] = useState([]);

  useEffect(() => {
    // Generate a new scramble when the component mounts
    randomScrambleForEvent("333").then((scramble) => {
      setScramble(scramble.toString());
    });
  }, []);

  useEffect(() => {
    const handleKeyup = (event) => {
      if (event.code === "Space") {
        if (!running) {
          startTimer();
        } else {
          stopTimer();
        }
      }
    };

    document.addEventListener("keyup", handleKeyup);

    return () => {
      document.removeEventListener("keyup", handleKeyup);
    };
  }, [running]);

  const startTimer = () => {
    setTimer(0);
    const startTime = Date.now() - timer;
    setRunning(true);
    const id = setInterval(() => {
      setTimer(Date.now() - startTime);
    }, 10);
    setIntervalId(id);
  };

  const stopTimer = () => {
    clearInterval(intervalId);

    // Store the current time in the array
    const formattedTime = formatTime(timer);
    setTimes((prevTimes) => [...prevTimes, formattedTime]); // Update times using setTimes

    // Generate a new scramble
    randomScrambleForEvent("333").then((scramble) => {
      setScramble(scramble.toString());
    });

    setRunning(false);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = time % 1000;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}:${String(milliseconds).padStart(3, "0")}`;
  };

  return (
    <main className={styles.main}>
      <div className={styles.timesContainer}>
        <h2>Times:</h2>
        <ul>
          {times.map((time, index) => (
            <li key={index}>{time}</li>
          ))}
        </ul>
      </div>
      <div className={styles.scrambleContainer}>
        <div className={styles.scramble}>{scramble}</div>
      </div>
      <div className={styles.timer}>{formatTime(timer)}</div>
    </main>
  );
}

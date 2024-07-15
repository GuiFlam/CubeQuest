"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { randomScrambleForEvent } from "cubing/scramble";
import { useEffect, useState } from "react";

randomScrambleForEvent("333").then((scramble) => {
  console.log(scramble.toString());
});

export default function Home() {
  const [puzzle, setPuzzle] = useState("3x3x3");
  const [scramble, setScramble] = useState("");
  const [timer, setTimer] = useState([]);
  const [running, setRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [times, setTimes] = useState([]);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(null);

  useEffect(() => {
    const loadTwistyScript = () => {
      const scriptId = "cubing-twisty-script";

      if (document.getElementById(scriptId)) {
        // Script is already loaded
        return;
      }

      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://cdn.cubing.net/js/cubing/twisty";
      script.type = "module";
      document.head.appendChild(script);
    };

    loadTwistyScript();
    // Generate a new scramble when the component mounts
    randomScrambleForEvent(removeXFromString(puzzle)).then((scramble) => {
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

    console.log("useEffect has ran, running is", running);

    return () => {
      document.removeEventListener("keyup", handleKeyup);
    };
  }, [running]);

  useEffect(() => {
    if (!running && timer > 0) {
      // Ensure this code runs only when the timer stops
      setTimes((prevTimes) => [...prevTimes, [timer, scramble]]);
      randomScrambleForEvent(removeXFromString(puzzle)).then((scramble) => {
        setScramble(scramble.toString());
      });
    }
  }, [running, timer]);

  useEffect(() => {
    // Save times to localStorage on change
    localStorage.setItem("times", JSON.stringify(times));
  }, [times]);

  const startTimer = () => {
    const startTime = Date.now();
    setTimer(0);
    setRunning(true);
    const id = setInterval(() => {
      setTimer(Date.now() - startTime);
    }, 10);
    setIntervalId(id);
  };

  const stopTimer = () => {
    clearInterval(intervalId);

    /*
    randomScrambleForEvent("333").then((scramble) => {
      setScramble(scramble.toString());
    });
    */
    setRunning(false);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10); // Divide by 10 to get two digits
    if (minutes === 0) {
      return `${String(seconds).padStart(2, "0")}.${String(
        milliseconds
      ).padStart(2, "0")}`;
    } else {
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
      )}:${String(milliseconds).padStart(2, "0")}`; // Ensure milliseconds are two digits
    }
  };

  const handleTimeClick = (index) => {
    if (selectedTimeIndex === index) {
      // If the clicked item is already selected, deselect it
      setSelectedTimeIndex(null);
    } else {
      // Otherwise, select the new item
      setSelectedTimeIndex(index);
    }
  };

  const calculateAverageOfFive = (times) => {
    if (times.length < 5) return null; // Return null if there are less than 5 solves

    // Take only the last 5 times
    const lastFiveTimes = times.slice(-5);

    // Map the lastFiveTimes array to extract the first element (actual time) from each sub-array
    const extractedTimes = lastFiveTimes.map((time) => time[0]);

    // Clone the extractedTimes array and sort it to find the middle three times
    const sortedTimes = [...extractedTimes].sort((a, b) => a - b);

    // Remove the best and worst times
    sortedTimes.pop(); // Remove the last element (worst time)
    sortedTimes.shift(); // Remove the first element (best time)

    // Calculate the average of the remaining 3 times
    const sum = sortedTimes.reduce((acc, curr) => acc + curr, 0);
    const average = sum / sortedTimes.length;

    return average; // Return the average as is, assuming further formatting/conversion is handled elsewhere
  };

  const calculateAverageOfTwelve = (times) => {
    if (times.length < 12) return null; // Return null if there are less than 12 solves

    const lastTwelveTimes = times.slice(-12);

    // Map the times array to extract the first element (actual time) from each sub-array
    const extractedTimes = lastTwelveTimes.map((time) => time[0]);

    // Clone the extractedTimes array and sort it to find the middle eight times
    const sortedTimes = [...extractedTimes].sort((a, b) => a - b);

    // Remove the best two and worst two times
    sortedTimes.pop(); // Remove the last element (worst time)
    sortedTimes.shift(); // Remove the first element (best time)

    // Calculate the average of the remaining 8 times
    const sum = sortedTimes.reduce((acc, curr) => acc + curr, 0);
    const average = sum / sortedTimes.length;

    return average; // Return the average as is, assuming further formatting/conversion is handled elsewhere
  };

  function removeXFromString(input) {
    return input.replace(/x/g, "");
  }

  return (
    <main className={styles.main}>
      <div className={styles.timesContainer}>
        <h2>
          Solves: {times.length}/{times.length}
        </h2>
        <ul>
          {times.map((time, index) => (
            <li key={index} onClick={() => handleTimeClick(index)}>
              {formatTime(time[0])}{" "}
              {selectedTimeIndex === index && <strong>{time[1]}</strong>}
            </li>
          ))}
        </ul>
        <button
          onClick={(e) => {
            const confirmDelete = window.confirm(
              "Are you sure you want to delete the last saved time?"
            );
            if (!confirmDelete) {
              return; // If the user cancels, do nothing
            }

            setTimes((prevTimes) => prevTimes.slice(0, -1));
            e.currentTarget.blur();
          }}
        >
          Delete last
        </button>
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(times)], {
              type: "text/plain",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "times.txt";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
        >
          Save Times
        </button>
        <input
          type="file"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const times = JSON.parse(e.target.result);
                setTimes(times);
              };
              reader.readAsText(file);
            }
          }}
        />
      </div>

      <div className={styles.scrambleContainer}>
        <div className={styles.puzzleSelector}>
          <select
            value={puzzle}
            onChange={(e) => {
              setPuzzle(e.target.value);
              randomScrambleForEvent(removeXFromString(e.target.value)).then(
                (scramble) => {
                  setScramble(scramble.toString());
                }
              );
              e.currentTarget.blur();
            }}
          >
            <option value="2x2x2">2x2x2</option>
            <option value="3x3x3">3x3x3</option>
            <option value="4x4x4">4x4x4</option>
          </select>
          <button
            onClick={(e) => {
              randomScrambleForEvent(removeXFromString(puzzle)).then(
                (scramble) => {
                  console.log(scramble.toString());
                  setScramble(scramble.toString());
                }
              );
              e.currentTarget.blur();
            }}
          >
            New scramble
          </button>
        </div>
        <div className={styles.scramble}>{scramble}</div>
      </div>
      <div className={styles.timer}>{formatTime(timer)}</div>
      <div className={styles.averageOfFive}>
        {times.length >= 5 && (
          <h1>ao5: {formatTime(calculateAverageOfFive(times))}</h1>
        )}
        {times.length >= 12 && (
          <h1>ao12: {formatTime(calculateAverageOfTwelve(times))}</h1>
        )}
      </div>
      <div style={{ position: "fixed", bottom: 0, right: 0, zIndex: 1000 }}>
        <twisty-player
          puzzle={puzzle}
          alg={scramble}
          background="none"
          control-panel="none"
        ></twisty-player>
      </div>
    </main>
  );
}

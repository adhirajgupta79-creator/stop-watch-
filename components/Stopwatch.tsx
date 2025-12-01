import React, { useState, useEffect, useRef, useCallback } from 'react';

interface StopwatchProps {}

const formatTime = (ms: number): string => {
  const hours = Math.floor(ms / 3600000);
  ms %= 3600000;
  const minutes = Math.floor(ms / 60000);
  ms %= 60000;
  const seconds = Math.floor(ms / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10); // Displaying centiseconds

  const pad = (num: number, digits = 2) => num.toString().padStart(digits, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds)}`;
};

const Stopwatch: React.FC<StopwatchProps> = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<number | undefined>(undefined);

  // Use useCallback to memoize functions that are passed as props or dependencies
  const startStopwatch = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = window.setInterval(() => {
        setTime((prevTime) => prevTime + 10); // Update every 10ms
      }, 10);
    }
  }, [isRunning]);

  const stopStopwatch = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      if (intervalRef.current !== undefined) {
        window.clearInterval(intervalRef.current);
      }
    }
  }, [isRunning]);

  const resetStopwatch = useCallback(() => {
    stopStopwatch(); // Ensure the stopwatch is stopped
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  }, [stopStopwatch]);

  const lapStopwatch = useCallback(() => {
    if (isRunning) {
      setLaps((prevLaps) => [...prevLaps, time]);
    }
  }, [isRunning, time]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (intervalRef.current !== undefined) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps - Run only on mount and unmount

  return (
    <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-6 sm:p-8 md:p-10 w-full max-w-sm sm:max-w-md md:max-w-lg flex flex-col items-center border border-white border-opacity-20">
      <div className="text-white text-5xl sm:text-6xl md:text-7xl font-mono mb-6 bg-gray-800 bg-opacity-70 p-4 rounded-lg w-full text-center tracking-wider">
        {formatTime(time)}
      </div>

      <div className="grid grid-cols-2 gap-4 w-full mb-6">
        <button
          onClick={isRunning ? stopStopwatch : startStopwatch}
          className={`flex-1 py-3 px-6 rounded-lg text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-md
            ${isRunning
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>

        <button
          onClick={resetStopwatch}
          disabled={isRunning && time === 0}
          className="flex-1 py-3 px-6 rounded-lg text-lg font-bold bg-gray-600 hover:bg-gray-700 text-white transition-all duration-300 transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
      </div>

      <button
        onClick={lapStopwatch}
        disabled={!isRunning}
        className="w-full py-3 px-6 rounded-lg text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        Lap
      </button>

      {laps.length > 0 && (
        <div className="w-full max-h-48 overflow-y-auto bg-gray-900 bg-opacity-50 rounded-lg p-4 custom-scrollbar">
          <h3 className="text-white text-xl font-semibold mb-3 border-b border-gray-700 pb-2">Laps</h3>
          <ul className="space-y-2">
            {laps.map((lapTime, index) => (
              <li key={index} className="flex justify-between items-center text-gray-200 text-base font-medium">
                <span className="text-indigo-300">Lap {index + 1}:</span>
                <span className="font-mono text-white">{formatTime(lapTime)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Stopwatch;
// components/Countdown.tsx
import { useEffect, useState } from "react";
import NumberFlow, { NumberFlowGroup } from "@number-flow/react";

interface CountdownProps {
  targetUnixTimestamp: number;
  className?: string;
}

export default function Countdown({
  targetUnixTimestamp,
  className = "",
}: CountdownProps) {
  // Track remaining time in seconds
  const [timeUnits, setTimeUnits] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Prevent unnecessary re-renders by calculating outside useEffect
  const calculateTimeUnits = (remainingSeconds: number) => {
    const days = Math.floor(remainingSeconds / 86400);
    const hours = Math.floor((remainingSeconds % 86400) / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    return { days, hours, minutes, seconds };
  };

  // Update the countdown timer every second
  useEffect(() => {
    // Only run if we have a valid timestamp
    if (!targetUnixTimestamp) return;

    const calculateRemainingTime = () => {
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const difference = Math.max(0, targetUnixTimestamp - now);

      setTimeUnits(calculateTimeUnits(difference));
    };

    // Calculate immediately on mount
    calculateRemainingTime();

    // Set up interval to update the time every second
    const interval = setInterval(calculateRemainingTime, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [targetUnixTimestamp]);

  // Labels for time units
  const timeLabels = ["DAYS", "HOURS", "MINS", "SECS"];
  const timeValues = [
    timeUnits.days,
    timeUnits.hours,
    timeUnits.minutes,
    timeUnits.seconds,
  ];

  return (
    <div className={`${className}`}>
      <NumberFlowGroup>
        <div className="flex items-center justify-center gap-3">
          {timeLabels.map((label, index) => (
            <div key={label} className="flex flex-col items-center">
              <div className="px-3 py-2 rounded-lg bg-slate-800/90 border border-indigo-500/20 shadow-md">
                <div className="text-3xl font-bold number-flow-container">
                  <NumberFlow
                    trend={-1}
                    value={timeValues[index]}
                    format={{ minimumIntegerDigits: 2 }}
                    // Apply different digit settings for different time units
                    digits={
                      index === 2 || index === 3 ? { 1: { max: 5 } } : undefined
                    }
                  />
                </div>
              </div>
              <span className="mt-1 text-xs font-medium text-slate-400">
                {label}
              </span>
            </div>
          ))}
        </div>
      </NumberFlowGroup>
    </div>
  );
}

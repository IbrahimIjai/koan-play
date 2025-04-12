"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface CountdownTimerProps {
  launchDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({ launchDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date(launchDate).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  return (
    <div className="flex flex-col items-center justify-center pointer-events-auto">
      <div className="grid grid-cols-4 gap-4 mb-6">
        <TimeUnit value={timeLeft.days} label="DAYS" />
        <TimeUnit value={timeLeft.hours} label="HOURS" />
        <TimeUnit value={timeLeft.minutes} label="MINUTES" />
        <TimeUnit value={timeLeft.seconds} label="SECONDS" />
      </div>
      <Button
        className="bg-white text-black hover:bg-white/90 font-semibold px-8 py-6 text-lg"
        onClick={() => window.open("https://example.com/learn-more", "_blank")}
      >
        LEARN MORE
      </Button>
    </div>
  );
}

interface TimeUnitProps {
  value: number;
  label: string;
}

function TimeUnit({ value, label }: TimeUnitProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-black/70 backdrop-blur-sm border border-white/30 rounded-lg w-20 h-20 flex items-center justify-center mb-2">
        <span className="text-white text-3xl font-bold">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="text-white text-xs font-semibold tracking-wider">
        {label}
      </span>
    </div>
  );
}

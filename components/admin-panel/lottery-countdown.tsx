"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface LotteryCountdownProps {
  endTime: number;
  status: number;
}

export default function LotteryCountdown({
  endTime,
  status,
}: LotteryCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    // Only run countdown for open lotteries
    if (status !== 1) {
      if (status === 0) setTimeLeft("Not started yet");
      else if (status === 2) setTimeLeft("Drawing in progress");
      else if (status === 3) setTimeLeft("Lottery ended");
      else setTimeLeft("Unknown status");
      return;
    }

    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const difference = endTime - now;

      if (difference <= 0) {
        setTimeLeft("0:00:00 (ended)");
        return;
      }

      const days = Math.floor(difference / 86400);
      const hours = Math.floor((difference % 86400) / 3600);
      const minutes = Math.floor((difference % 3600) / 60);
      const seconds = difference % 60;

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(
          `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        );
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime, status]);

  const getStatusColor = () => {
    switch (status) {
      case 0:
        return "bg-amber-500";
      case 1:
        return "bg-emerald-500";
      case 2:
        return "bg-blue-500";
      case 3:
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <span className="text-sm font-medium">Time remaining:</span>
      </div>
      <Badge variant="outline" className="text-sm font-mono">
        {timeLeft}
      </Badge>
    </div>
  );
}

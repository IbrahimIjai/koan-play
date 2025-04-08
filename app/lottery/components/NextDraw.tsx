"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import TicketModal from "./TicketModal";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { prizeAllocation } from "../lib/lotteryService";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown, Info } from "lucide-react";

interface PrizeAllocation {
  name: string;
  percentage: string;
}

interface LotteryPrizeDisplayProps {
  totalPrizeValue: number;
  totalPrizeCake: number;
  cakePrice: number;
}

export default function NextDraw() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // State for countdown
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 21,
    seconds: 0,
  });

  const prizePot = {
    usd: "$36,636",
    cake: "20,391 USDC",
  };

  const { isConnected } = useAccount();

  const totalPrizeValue = 40000;
  const totalPrizeCake = 22857; // Assuming CAKE price of $1.75 for this example
  const cakePrice = 1.75;

  // Calculate actual prize amounts based on percentages
  const calculatePrizes = (allocations: PrizeAllocation[]) => {
    return allocations.map((allocation) => {
      const percentageValue = Number.parseFloat(allocation.percentage) / 100;
      const cakeAmount = Math.round(totalPrizeCake * percentageValue);
      const usdValue = Math.round(cakeAmount * cakePrice);

      return {
        tier: allocation.name,
        percentage: allocation.percentage,
        cakeAmount: cakeAmount.toLocaleString(),
        usdValue: `$${usdValue.toLocaleString()}`,
      };
    });
  };

  // Update countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleBuyTickets = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsModalOpen(true);
  };

  const prizes = calculatePrizes(prizeAllocation);

  return (
    <div className="rounded-2xl border shadow overflow-hidden">
      <div className="p-6 text-center ">
        <h2 className="text-lg font-bold mb-4">Get your tickets now!</h2>

        <div className="flex justify-center items-center gap-2 text-yellow-300 mb-8">
          <div className="text-xl font-bold">{timeLeft.hours}</div>
          <div className="text-2xl">h</div>
          <div className="text-xl font-bold">{timeLeft.minutes}</div>
          <div className="text-3xl">m</div>
          <div className="text-white ">until the draw</div>
        </div>

        <div className=" p-6 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm">Next Draw</p>
            <div className="text-muted-foreground text-xs">
              #1588 | Draw: Apr 6, 2025, 1:00 PM
            </div>
          </div>

          <div className="flex justify-between items-center py-4 border-b border-gray-700">
            <p className="text-sm">Prize Pot</p>
            <div>
              <p className="text-primary text-lg font-bold">~{prizePot.usd}</p>
              <p className="text-muted-foreground text-right text-xs">
                {prizePot.cake}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center py-4 border-b border-gray-700">
            <p className="text-sm">Your tickets</p>
            <Button
              onClick={handleBuyTickets}
              className=" transition-all duration-200"
            >
              Buy Tickets
            </Button>
          </div>

          <div className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800">
            {/* Header with total prize info */}
            <div className="relative bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="relative z-10 flex flex-col items-center justify-center px-4 py-6">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
                >
                  Total Prize Pool
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-baseline gap-2 mb-2"
                >
                  <span className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                    ${totalPrizeValue.toLocaleString()}
                  </span>
                  <span className="text-lg md:text-xl font-medium text-gray-600 dark:text-gray-400">
                    ({totalPrizeCake.toLocaleString()} CAKE)
                  </span>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-center text-gray-600 dark:text-gray-400"
                >
                  Match the winning number in the same order to share prizes
                </motion.p>
              </div>
            </div>

            {/* Prize cards container */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className={cn(
                "transition-all duration-500 ease-in-out px-4 py-6 bg-white dark:bg-gray-900",
                isExpanded ? "max-h-[2000px]" : "max-h-0 py-0 overflow-hidden",
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {prizes.map((prize, index) => (
                  <motion.div
                    key={prize.tier}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: isLoaded ? 1 : 0,
                      y: isLoaded ? 0 : 20,
                    }}
                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    onMouseEnter={() => setActiveCard(index)}
                    onMouseLeave={() => setActiveCard(null)}
                  >
                    <Card
                      className={cn(
                        "overflow-hidden h-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900",
                        activeCard === index ? "shadow-lg" : "shadow-sm",
                        index === 0 ? "border-t-2 border-t-amber-500" : "",
                        index === 1 || index === 2
                          ? "border-t-2 border-t-gray-500"
                          : "",
                        index > 2 ? "border-t-2 border-t-gray-300" : "",
                      )}
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {prize.tier}
                            </h3>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 text-xs font-medium rounded flex items-center gap-1">
                                  {prize.percentage}
                                  <Info className="h-3 w-3 text-gray-500" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                  Percentage of total prize pool
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <div className="mt-6 flex items-baseline">
                          <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            {prize.cakeAmount}
                          </span>
                          <span className="ml-1 text-lg font-medium text-gray-600 dark:text-gray-400">
                            CAKE
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          ~{prize.usdValue}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Toggle button */}
            <div className="flex justify-center py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 px-6 py-2 rounded-full"
              >
                {isExpanded ? "Hide" : "Show"} Prizes
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Modal */}
      <TicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

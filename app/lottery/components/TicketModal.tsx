"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type TicketModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function TicketModal({ isOpen, onClose }: TicketModalProps) {
  const [ticketCount, setTicketCount] = useState(1);
  const [ticketCost] = useState("5");
  const [totalCost, setTotalCost] = useState("5");
  const [maxTickets] = useState(50);
  const [userBalance] = useState("100");
  const [randomizedNumbers, setRandomizedNumbers] = useState<number[][]>([]);
  const [insufficientBalance, setInsufficientBalance] = useState(false);

  const { isConnected } = useAccount();

  useEffect(() => {
    if (isOpen) {
      generateRandomNumbers(ticketCount);
      // Check balance when modal opens
      checkBalance(ticketCount);
    }
  }, [isOpen, ticketCount]);

  // Calculate total cost when ticket count changes
  useEffect(() => {
    // Slight discount for bulk purchases
    const discountDivisor = 300;
    const discount = Math.max(0, ticketCount - 1) / discountDivisor;
    const discountedCost = Number(ticketCost) * ticketCount * (1 - discount);
    setTotalCost(discountedCost.toFixed(2));

    // Check balance whenever cost changes
    checkBalance(ticketCount);
  }, [ticketCount, ticketCost]);

  const checkBalance = (count: number) => {
    const discountDivisor = 300;
    const discount = Math.max(0, count - 1) / discountDivisor;
    const cost = Number(ticketCost) * count * (1 - discount);

    setInsufficientBalance(cost > Number(userBalance));
  };

  const generateRandomNumbers = (count: number) => {
    const newNumbers = [];
    for (let i = 0; i < count; i++) {
      // Generate a 6-digit random number
      const digits = [];
      for (let j = 0; j < 6; j++) {
        digits.push(Math.floor(Math.random() * 10));
      }
      newNumbers.push(digits);
    }
    setRandomizedNumbers(newNumbers);
  };

  const handleTicketCountChange = (count: number) => {
    if (count >= 1 && count <= maxTickets) {
      setTicketCount(count);
    }
  };

  const handleRandomize = () => {
    generateRandomNumbers(ticketCount);
    toast.info("Numbers randomized!");
  };

  const handleBuyTickets = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    // Check balance
    if (insufficientBalance) {
      toast.error("Insufficient balance");
      return;
    }

    toast.success(
      `Bought ${ticketCount} ticket${ticketCount !== 1 ? "s" : ""}!`,
    );
    onClose();
  };

  const getDiscountPercentage = () => {
    if (ticketCount <= 1) return 0;
    const discountDivisor = 300;
    return Math.round(((ticketCount - 1) / discountDivisor) * 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#272335] border-0 text-white max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-white text-2xl font-bold">
              Buy Tickets
            </DialogTitle>
            <DialogClose className="text-gray-400 hover:text-white" />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Buy:</span>
              <div className="flex items-center">
                <span className="text-white">Tickets</span>
                <span className="text-yellow-300 ml-1 text-lg">🎟️</span>
              </div>
            </div>

            <div className="relative border-2 border-yellow-500 rounded-full overflow-hidden p-4">
              <Input
                type="number"
                value={ticketCount}
                onChange={(e) =>
                  handleTicketCountChange(parseInt(e.target.value) || 1)
                }
                className="bg-transparent border-0 text-right text-xl text-white w-full pr-20 focus:outline-none"
                aria-label="Number of tickets"
                id="ticket-count"
                name="ticket-count"
                min="1"
                max={maxTickets}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                ~{totalCost} USDT
              </div>

              {insufficientBalance && (
                <div className="text-pink-500 text-center mt-1">
                  Insufficient USDT balance
                </div>
              )}
              <div className="text-gray-400 text-right text-sm mt-1">
                USDT Balance: {userBalance}
              </div>
            </div>

            <div className="flex justify-between items-center mt-4 text-gray-300">
              <span>Cost (USDT)</span>
              <span>{totalCost} USDT</span>
            </div>

            <div className="flex justify-between items-center mt-2 text-gray-300">
              <div className="flex items-center">
                <span>{getDiscountPercentage()}% Bulk discount</span>
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </div>
              <span>
                ~
                {((getDiscountPercentage() / 100) * Number(totalCost)).toFixed(
                  2,
                )}{" "}
                USDT
              </span>
            </div>

            <div className="flex justify-between items-center mt-2 text-white text-lg font-semibold border-t border-gray-700 pt-2">
              <span>You pay</span>
              <span>~{totalCost} USDT</span>
            </div>
          </div>

          <Button
            onClick={handleBuyTickets}
            className="w-full bg-teal-400 hover:bg-teal-500 text-black py-6 rounded-full transition-all duration-200"
            disabled={insufficientBalance}
          >
            Buy Instantly
          </Button>

          <div className="text-gray-400 text-sm text-center px-4">
            &quot;Buy Instantly&quot; chooses random numbers, with no duplicates
            among your tickets. Prices are set before each round starts, equal
            to $5 at that time. Purchases are final.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

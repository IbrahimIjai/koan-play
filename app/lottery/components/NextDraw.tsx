"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import TicketModal from "./TicketModal";

export default function NextDraw() {
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const ticketInfo = [
    { id: 1, name: "Match first 1", amount: "408 USDC", usdValue: "~$733" },
    { id: 2, name: "Match first 2", amount: "612 USDC", usdValue: "~$1,099" },
    { id: 3, name: "Match first 3", amount: "1,020 USDC", usdValue: "~$1,832" },
    { id: 4, name: "Match first 4", amount: "2,039 USDC", usdValue: "~$3,664" },
    { id: 5, name: "Match first 5", amount: "4,078 USDC", usdValue: "~$7,327" },
    { id: 6, name: "Match all 6", amount: "8,156 USDC", usdValue: "~$14,654" },
    { id: 7, name: "Burn", amount: "4,078 USDC", usdValue: "~$7,327" },
  ];

  const { isConnected } = useAccount();

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

  return (
    <div className="rounded-2xl bg-gray-900 shadow-2xl overflow-hidden">
      <div className="p-6 text-center text-white">
        <h2 className="text-4xl font-bold mb-4">Get your tickets now!</h2>

        <div className="flex justify-center items-center gap-2 text-yellow-300 mb-8">
          <div className="text-6xl font-bold">{timeLeft.hours}</div>
          <div className="text-3xl">h</div>
          <div className="text-6xl font-bold">{timeLeft.minutes}</div>
          <div className="text-3xl">m</div>
          <div className="text-white text-2xl">until the draw</div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">Next Draw</h3>
            <div className="text-gray-400">
              #1588 | Draw: Apr 6, 2025, 1:00 PM
            </div>
          </div>

          <div className="flex justify-between items-center py-4 border-b border-gray-700">
            <h4 className="text-xl font-bold">Prize Pot</h4>
            <div>
              <div className="text-purple-400 text-3xl font-bold">
                ~{prizePot.usd}
              </div>
              <div className="text-gray-400 text-right">{prizePot.cake}</div>
            </div>
          </div>

          <div className="flex justify-between items-center py-4 border-b border-gray-700">
            <h4 className="text-xl font-bold">Your tickets</h4>
            <button
              onClick={handleBuyTickets}
              className="bg-teal-400 hover:bg-teal-500 text-black font-bold py-2 px-8 rounded-full transition-all duration-200"
            >
              Buy Tickets
            </button>
          </div>

          <div className="py-4">
            <p className="text-gray-300 mb-6">
              Match the winning number in the same order to share prizes.
              Current prizes up for grabs:
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {ticketInfo.slice(0, 4).map((ticket) => (
                <div key={ticket.id} className="text-center">
                  <div className="text-purple-400 font-bold mb-1">
                    {ticket.name}
                  </div>
                  <div className="text-white font-bold">{ticket.amount}</div>
                  <div className="text-gray-400 text-sm">{ticket.usdValue}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {ticketInfo.slice(4).map((ticket) => (
                <div key={ticket.id} className="text-center">
                  <div
                    className={`font-bold mb-1 ${ticket.id === 7 ? "text-pink-500" : "text-purple-400"}`}
                  >
                    {ticket.name}
                  </div>
                  <div className="text-white font-bold">{ticket.amount}</div>
                  <div className="text-gray-400 text-sm">{ticket.usdValue}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-6">
            <button className="text-teal-400 hover:text-teal-300 font-semibold flex items-center justify-center w-full">
              Hide <span className="ml-2">▲</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ticket Modal */}
      <TicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

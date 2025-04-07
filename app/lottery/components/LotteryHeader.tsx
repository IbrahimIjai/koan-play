"use client";

import { useState } from "react";
import TicketModal from "./TicketModal";
import ConnectButton from "@/components/connect-button";

export default function LotteryHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const prizePot = "$36,636";
  // Sparkle animation components
  const Sparkle = ({ className = "" }: { className?: string }) => (
    <div className={`text-yellow-300 text-2xl ${className}`}>✨</div>
  );

  const handleBuyTickets = () => {
    setIsModalOpen(true);
  };

  return (
    <section className="text-center py-12 relative">
      {/* Animated sparkles */}
      <Sparkle className="absolute left-1/4 top-0 animate-bounce" />
      <Sparkle className="absolute right-1/4 bottom-20 animate-pulse" />
      <Sparkle className="absolute left-10 bottom-10 animate-ping" />
      <Sparkle className="absolute right-10 top-10 animate-bounce" />

      <ConnectButton />
      <h1 className="text-lg font-bold text-white mb-2">
        The PancakeSwap Lottery
      </h1>

      <div className="flex flex-col items-center justify-center">
        <div className="text-yellow-300 text-7xl font-bold mb-2">
          {prizePot}
        </div>
        <div className="text-white text-2xl">in Prizes!</div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleBuyTickets}
          className="bg-indigo-400 hover:bg-indigo-500 text-white font-bold py-3 px-10 rounded-full transition-all duration-200"
        >
          Buy Tickets
        </button>
      </div>

      {/* Ticket Modal */}
      <TicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}

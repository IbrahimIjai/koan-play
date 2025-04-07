"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";

export default function FinishedRounds() {
  const [activeTab, setActiveTab] = useState("all"); // "all" or "your"
  const currentRound = {
    id: 1587,
    drawn: "Apr 5, 2025, 1:00 AM",
    winningNumber: [5, 6, 4, 1, 1, 3],
    prizeAmount: "~$30,858",
    cakeAmount: "17,168 USDC",
    totalPlayers: 96,
    brackets: [
      {
        name: "Match first 1",
        reward: "343 USDC",
        usdValue: "~$617",
        winningTickets: 45,
        rewardEach: "7.63 USDC each",
      },
      {
        name: "Match first 2",
        reward: "515 USDC",
        usdValue: "~$926",
        winningTickets: 3,
        rewardEach: "171.68 USDC each",
      },
      {
        name: "Match first 3",
        reward: "858 USDC",
        usdValue: "~$1,543",
        winningTickets: 1,
        rewardEach: "858.41 USDC each",
      },
      {
        name: "Match first 4",
        reward: "1,717 USDC",
        usdValue: "~$3,086",
        winningTickets: 0,
        rewardEach: "",
      },
      {
        name: "Match first 5",
        reward: "3,434 USDC",
        usdValue: "~$6,172",
        winningTickets: 0,
        rewardEach: "",
      },
      {
        name: "Match all 6",
        reward: "6,867 USDC",
        usdValue: "~$12,343",
        winningTickets: 0,
        rewardEach: "",
      },
      {
        name: "Burn",
        reward: "3,434 USDC",
        usdValue: "~$6,172",
        winningTickets: 0,
        rewardEach: "",
      },
    ],
  };

  const { isConnected } = useAccount();

  const handleConnect = () => {
    if (isConnected) {
      toast.info("Already connected");
      return;
    }

    // Connect wallet here
    toast.info("Connect your wallet to view your history");
  };

  const handleNavigate = (direction: "prev" | "next" | "latest") => {
    toast.info(`Navigate ${direction}`);
    // Update currentRound based on direction
  };

  return (
    <div>
      <h2 className="text-white text-4xl font-bold text-center mb-8">
        Finished Rounds
      </h2>

      <div className="bg-gray-800 rounded-2xl overflow-hidden">
        <div className="bg-gray-700 p-2 flex rounded-full m-4 w-fit">
          <button
            className={`px-6 py-2 rounded-full font-semibold ${
              activeTab === "all"
                ? "bg-gray-900 text-white"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("all")}
          >
            All History
          </button>
          <button
            className={`px-6 py-2 rounded-full font-semibold ${
              activeTab === "your"
                ? "bg-gray-900 text-white"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("your")}
          >
            Your History
          </button>
        </div>

        {activeTab === "all" ? (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <h3 className="text-white text-2xl font-bold mr-4">Round</h3>
                <div className="bg-gray-700 px-4 py-1 rounded-lg text-white font-semibold">
                  {currentRound.id}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleNavigate("prev")}
                  className="text-white p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  ←
                </button>
                <button
                  onClick={() => handleNavigate("next")}
                  className="text-white p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  →
                </button>
                <button
                  onClick={() => handleNavigate("latest")}
                  className="text-white p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  ⇥
                </button>
              </div>
            </div>

            <div className="text-gray-400 mb-8">Drawn {currentRound.drawn}</div>

            <div className="mb-12">
              <h4 className="text-white text-xl font-bold mb-4">
                Winning Number
              </h4>

              <div className="flex justify-center gap-2 relative">
                {currentRound.winningNumber.map((number, index) => (
                  <div
                    key={index}
                    className={`
                    w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold
                    ${index === 0 ? "bg-pink-500" : ""}
                    ${index === 1 ? "bg-purple-500" : ""}
                    ${index === 2 ? "bg-cyan-500" : ""}
                    ${index === 3 ? "bg-green-500" : ""}
                    ${index === 4 ? "bg-lime-500" : ""}
                    ${index === 5 ? "bg-yellow-500" : ""}
                  `}
                  >
                    {number}
                  </div>
                ))}

                {/* Latest badge */}
                <div className="absolute -top-2 -right-8 bg-purple-500 px-3 py-1 text-xs font-bold rounded-lg transform rotate-12">
                  Latest
                </div>
              </div>
            </div>

            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-white text-xl font-bold">Prize pot</h4>
                <div className="text-purple-400 text-3xl font-bold">
                  {currentRound.prizeAmount}
                </div>
                <div className="text-gray-400">{currentRound.cakeAmount}</div>
              </div>

              <div className="text-gray-400">
                <div>
                  Match the winning number in the same order to share prizes.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {currentRound.brackets.slice(0, 4).map((bracket, index) => (
                <div key={index} className="text-center">
                  <div className="text-purple-400 font-bold mb-1">
                    {bracket.name}
                  </div>
                  <div className="text-white font-bold">{bracket.reward}</div>
                  <div className="text-gray-400 text-sm">
                    {bracket.usdValue}
                  </div>
                  {bracket.winningTickets > 0 && (
                    <>
                      <div className="text-gray-400 text-sm">
                        {bracket.rewardEach}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {bracket.winningTickets} Winning Tickets
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {currentRound.brackets.slice(4).map((bracket, index) => (
                <div key={index} className="text-center">
                  <div
                    className={`font-bold mb-1 ${index === 2 ? "text-pink-500" : "text-purple-400"}`}
                  >
                    {bracket.name}
                  </div>
                  <div className="text-white font-bold">{bracket.reward}</div>
                  <div className="text-gray-400 text-sm">
                    {bracket.usdValue}
                  </div>
                  {bracket.winningTickets > 0 && (
                    <>
                      <div className="text-gray-400 text-sm">
                        {bracket.rewardEach}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {bracket.winningTickets} Winning Tickets
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-gray-700 pt-4 text-gray-400">
              Total players this round: {currentRound.totalPlayers}
            </div>

            <div className="text-center mt-6">
              <button className="text-teal-400 hover:text-teal-300 font-semibold flex items-center justify-center w-full">
                Hide <span className="ml-2">▲</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <h3 className="text-gray-300 text-xl mb-6">
              Connect your wallet to check your history
            </h3>

            <button
              onClick={handleConnect}
              className="bg-teal-400 hover:bg-teal-500 text-black font-bold py-3 px-10 rounded-full transition-all duration-200"
            >
              Connect Wallet
            </button>

            <div className="text-gray-500 mt-8">
              Only showing data for Lottery V2
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

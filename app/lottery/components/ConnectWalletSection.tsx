"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function ConnectWalletSection() {
  const { isConnected } = useAccount();
  const [checkingState, setCheckingState] = useState<
    "idle" | "checking" | "winner" | "no-win"
  >("idle");

  const handleConnect = () => {
    if (isConnected) {
      // Start checking process
      setCheckingState("checking");

      // Simulate checking for wins (replace with actual contract call)
      setTimeout(() => {
        // Random result for demo - 30% chance of winning
        const hasWon = Math.random() < 0.3;
        setCheckingState(hasWon ? "winner" : "no-win");

        if (hasWon) {
          toast.success("🎉 You've won a prize!");
        } else {
          toast.info("No prizes to collect this time. Better luck next round!");
        }
      }, 2000);

      return;
    }

    // Connect wallet here
    toast.info("Connect your wallet to check your wins");
  };

  // Render the appropriate section based on connection and checking state
  const renderContent = () => {
    if (!isConnected) {
      return (
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold mb-4">
            Connect your wallet
            <br />
            to check if you&apos;ve won!
          </h2>

          <Button
            onClick={handleConnect}
            className="rounded-full transition-all duration-200"
          >
            Connect Wallet
          </Button>
        </div>
      );
    }

    switch (checkingState) {
      case "idle":
        return (
          <div className="text-center">
            <h2 className="text-white text-2xl font-bold mb-4">
              Are you a winner?
            </h2>

            <Button
              onClick={handleConnect}
              className="bg-teal-400 hover:bg-teal-500 text-black font-bold py-3 px-10 rounded-full transition-all duration-200"
            >
              Check Now
            </Button>
          </div>
        );

      case "checking":
        return (
          <div className="text-center">
            <div className="animate-pulse">
              <h2 className="text-white text-2xl font-bold mb-4">
                Checking lottery results...
              </h2>

              <div className="flex justify-center gap-3">
                <div
                  className="w-3 h-3 bg-teal-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-3 h-3 bg-teal-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
                <div
                  className="w-3 h-3 bg-teal-400 rounded-full animate-bounce"
                  style={{ animationDelay: "600ms" }}
                ></div>
              </div>
            </div>
          </div>
        );

      case "winner":
        return (
          <div className="text-center">
            <div className="animate-bounce mb-4">
              <span className="text-yellow-300 text-3xl">🎉</span>
            </div>

            <h2 className="text-white text-2xl font-bold mb-4">
              Congratulations!
              <br />
              You&apos;ve won a prize!
            </h2>

            <Button
              onClick={() => toast.info("Claiming your prize...")}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-10 rounded-full transition-all duration-200 mb-4"
            >
              Claim Now
            </Button>

            <div className="text-gray-300 text-sm">
              Prizes not claimed within 24 hours are forfeited
            </div>
          </div>
        );

      case "no-win":
        return (
          <div className="text-center">
            <div className="mb-4 opacity-70">
              <span className="text-gray-400 text-3xl">🎫</span>
            </div>

            <h2 className="text-white text-2xl font-bold mb-4">
              No prizes to collect...
              <br />
              Better luck next time!
            </h2>

            <Button
              onClick={() => setCheckingState("idle")}
              className="bg-teal-400 hover:bg-teal-500 text-black font-bold py-3 px-10 rounded-full transition-all duration-200"
            >
              Check Again
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="bg-secondary rounded-2xl p-8 relative overflow-hidden">
      {/* Ticket decorations */}
      <div className="absolute left-10 top-1/2 transform -translate-y-1/2 rotate-12">
        <div className="w-16 h-8 bg-yellow-300 rounded opacity-70"></div>
      </div>
      <div className="absolute right-10 top-1/2 transform -translate-y-1/2 -rotate-12">
        <div className="w-16 h-8 bg-purple-300 rounded opacity-70"></div>
      </div>

      <div className="relative z-10 py-6">{renderContent()}</div>
    </div>
  );
}

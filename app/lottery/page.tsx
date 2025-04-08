"use client";

import LotteryHeader from "./components/LotteryHeader";
import NextDraw from "./components/NextDraw";
import FinishedRounds from "./components/FinishedRounds";
import HowToPlay from "./components/HowToPlay";
import ConnectWalletSection from "./components/ConnectWalletSection";
import PrizeFunds from "./components/PrizeFunds";

export default function Lottery() {
  return (
    <div className="min-h-screen  py-8 px-4 lg:px-8">
     
      <div className="max-w-5xl mx-auto space-y-16">
        <LotteryHeader />
        <NextDraw />
        <ConnectWalletSection />
        <FinishedRounds />
        <HowToPlay />
        <PrizeFunds />
      </div>
    </div>
  );
}

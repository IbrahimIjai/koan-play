"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { ChevronDown, Clock, Ticket, Trophy } from "lucide-react";
import { LOTTERY_ABI } from "@/configs/abis";
import { CONTRACTS } from "@/configs/contracts-confg";
import { base } from "viem/chains";
import { getTokenByAddress } from "@/configs/token-list";
import { format } from "date-fns";
import BuyTicketDialog from "./buy-ticket-dialog";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import NumberFlow, { NumberFlowGroup } from "@number-flow/react";
import { Skeleton } from "../ui/skeleton";

export default function LotteryTicketADSCard() {
  const { address, isConnected, chainId } = useAccount();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [tokenSymbol, setTokenSymbol] = useState("USDC");
  const [tokenDecimals, setTokenDecimals] = useState(6);

  const { data: currentLotteryId, isLoading: isLotteryIdLoading } =
    useReadContract({
      address: CONTRACTS.LOTTERY.address[chainId || base.id],
      abi: LOTTERY_ABI,
      functionName: "viewCurrentLotteryId",
      chainId,
    });

  // Get payment token address
  const { data: paymentTokenAddress} =
    useReadContract({
      address: CONTRACTS.LOTTERY.address[chainId || base.id],
      abi: LOTTERY_ABI,
      functionName: "paymentToken",
      chainId,
    });

  useEffect(() => {
    if (paymentTokenAddress) {
      const tokenInfo = getTokenByAddress(chainId || base.id, paymentTokenAddress);
      if (tokenInfo) {
        setTokenSymbol(tokenInfo.symbol);
        setTokenDecimals(tokenInfo.decimals);
      }
    }
  }, [paymentTokenAddress]);

  const { data: lotteryInfo, isLoading: isLotteryInfoLoading } =
    useReadContract({
      address: CONTRACTS.LOTTERY.address[chainId || base.id],
      abi: LOTTERY_ABI,
      functionName: "viewLottery",
      args: [currentLotteryId || 0n],
      query: {
        enabled: currentLotteryId !== undefined,
      },
    });

  const { data: userTicketsData, isLoading: isUserTicketsLoading } =
    useReadContract({
      address: CONTRACTS.LOTTERY.address[chainId || base.id],
      abi: LOTTERY_ABI,
      functionName: "viewUserInfoForLotteryId",
      args: [address || "0x0", currentLotteryId || 0n, 0n, 100n],
      query: {
        enabled: isConnected && currentLotteryId !== undefined,
      },
    });

  const userTicketCount =
    userTicketsData && userTicketsData[0] ? userTicketsData[0].length : 0;

  // Format prize pool
  const prizePool = lotteryInfo
    ? formatUnits(lotteryInfo.amountCollectedInPaymentToken, tokenDecimals)
    : "0.00";

  // Assuming 1 token = $2 USD (adjust based on your token)
  const prizePoolUsd = parseFloat(prizePool) * 2;

  // Format draw date
  const drawDate =
    lotteryInfo && lotteryInfo.endTime
      ? format(
          new Date(Number(lotteryInfo.endTime) * 1000),
          "MMM d, yyyy, h:mm a",
        )
      : "";

  const isLotteryOpen = lotteryInfo?.status === 1;

  // Calculate prize breakdowns based on rewards breakdown
  const calculatePrizeBreakdowns = () => {
    if (!lotteryInfo) return [];

    const totalPrize = parseFloat(prizePool);
    const treasuryFee = Number(lotteryInfo.treasuryFee) / 10000;
    const prizeDistribution = totalPrize * (1 - treasuryFee);

    const brackets = [];
    for (let i = 0; i < 6; i++) {
      const percentage = Number(lotteryInfo.rewardsBreakdown[i]) / 10000;
      const bracketPrize = prizeDistribution * percentage;

      brackets.push({
        match: i + 1,
        prize: bracketPrize,
        percentage,
      });
    }

    return brackets;
  };

  const prizeBreakdowns = calculatePrizeBreakdowns();

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className="overflow-hidden border shadow-md">
        {/* Card Header with Countdown */}
        <CardHeader className="bg-gradient-to-r from-primary to-indigo-600 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Next Draw</h2>
            <div className="text-sm font-medium opacity-90">
              {isLotteryIdLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                `#${currentLotteryId?.toString() || "..."}`
              )}
              {" | "}
              {isLotteryInfoLoading ? (
                <Skeleton className="h-4 w-32 inline-block" />
              ) : (
                drawDate
              )}
            </div>
          </div>

          {isLotteryInfoLoading ? (
            <div className="mt-6 flex justify-center">
              <Skeleton className="h-16 w-full  rounded-md" />
            </div>
          ) : (
            isLotteryOpen && (
              <LotteryCountdown endTime={Number(lotteryInfo?.endTime || 0)} />
            )
          )}
        </CardHeader>

        <CardContent className="p-0">
          {/* Prize Pool Section */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Prize Pot</p>
                {isLotteryInfoLoading ? (
                  <>
                    <Skeleton className="h-8 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-purple-600">
                      ~$
                      {prizePoolUsd.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {parseFloat(prizePool).toLocaleString(undefined, {
                        maximumFractionDigits: 4,
                      })}{" "}
                      {tokenSymbol}
                    </p>
                  </>
                )}
              </div>
              <div>
                <Trophy className="h-12 w-12 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* User Tickets Section */}
          <div className="p-6 flex justify-between items-center border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-purple-500" />
                <p className="text-lg font-semibold">Your tickets</p>
              </div>
              {isConnected ? (
                isUserTicketsLoading ? (
                  <Skeleton className="h-4 w-48 mt-1" />
                ) : (
                  <p className="text-sm text-gray-500 mt-1">
                    You have {userTicketCount} ticket
                    {userTicketCount !== 1 ? "s" : ""} this round
                  </p>
                )
              ) : (
                <p className="text-sm text-gray-500 mt-1">
                  Connect wallet to view tickets
                </p>
              )}
            </div>
            <BuyTicketDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              buttonClassName={cn(
                "font-medium py-2 px-4 rounded-lg",
                isLotteryInfoLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 text-white",
              )}
              buttonText={
                isLotteryInfoLoading
                  ? "Loading..."
                  : Number(lotteryInfo?.status) === 1
                    ? "Get Tickets"
                    : Number(lotteryInfo?.status) === 0
                      ? "Preparing"
                      : Number(lotteryInfo?.status) === 2
                        ? "Drawing"
                        : "Finished"
              }
              // disabled={isLotteryInfoLoading || !isLotteryOpen}
            />
          </div>
        </CardContent>

        {/* Card Footer with Collapsible Details */}
        <CardFooter className="p-0">
          <Collapsible
            open={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
            className="w-full"
          >
            <CollapsibleTrigger className="w-full flex items-center justify-center p-4 text-purple-600 hover:text-purple-800 hover:bg-gray-50 transition-colors">
              Prize Details
              <ChevronDown
                className={cn(
                  "ml-2 h-4 w-4 transition-transform",
                  isDetailsOpen && "rotate-180",
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t">
              <div className="p-6 space-y-4">
                <h4 className="font-medium text-muted-foreground mb-3">
                  Prize Breakdowns
                </h4>

                <div className="space-y-3">
                  {isLotteryInfoLoading
                    ? Array(6)
                        .fill(0)
                        .map((_, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-6 w-24" />
                          </div>
                        ))
                    : prizeBreakdowns.map((bracket, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold 
                            ${index === 5 ? "bg-yellow-500 text-white" : "bg-purple-100 text-purple-800"}`}
                            >
                              {bracket.match}
                            </div>
                            <span className="ml-2 text-sm">
                              {index === 5
                                ? "Match all 6"
                                : `Match first ${bracket.match}`}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-purple-700">
                              {bracket.prize.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}{" "}
                              {tokenSymbol}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ~$
                              {(bracket.prize * 2).toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                </div>

                <div className="pt-3 border-t flex items-center justify-between px-2">
                  <div>
                    <h4 className="font-medium">
                      Ticket Price
                    </h4>
                    {isLotteryInfoLoading ? (
                      <Skeleton className="h-5 w-24 mt-1" />
                    ) : (
                      <p className="text-muted-foreground text-xs">
                        {lotteryInfo
                          ? `${formatUnits(lotteryInfo.priceTicketInPaymentToken, tokenDecimals)} ${tokenSymbol}`
                          : "Loading..."}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium ">
                    Lottery Status
                  </h4>
                  {isLotteryInfoLoading ? (
                    <Skeleton className="h-6 w-20 mt-1" />
                  ) : (
                    <p
                      className={cn(
                        "inline-block px-2 py-1 rounded text-sm",
                        lotteryInfo?.status === 0 &&
                          "bg-yellow-100 text-yellow-800",
                        lotteryInfo?.status === 1 &&
                          "bg-green-100 text-green-800",
                        lotteryInfo?.status === 2 &&
                          "bg-blue-100 text-blue-800",
                        lotteryInfo?.status === 3 &&
                          "bg-purple-100 text-purple-800",
                      )}
                    >
                      {lotteryInfo?.status === 0 && "Pending"}
                      {lotteryInfo?.status === 1 && "Open"}
                      {lotteryInfo?.status === 2 && "Closed"}
                      {lotteryInfo?.status === 3 && "Claimable"}
                      {lotteryInfo === undefined && "Loading..."}
                    </p>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardFooter>
      </Card>
    </div>
  );
}

// Separate countdown component to avoid re-rendering issues
// Enhanced countdown component with NumberFlowGroup for coordinated animations
function LotteryCountdown({ endTime }: { endTime: number }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!endTime) return;

    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);

      if (now >= endTime) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const secondsLeft = endTime - now;
      const days = Math.floor(secondsLeft / 86400);
      const hours = Math.floor((secondsLeft % 86400) / 3600);
      const minutes = Math.floor((secondsLeft % 3600) / 60);
      const seconds = secondsLeft % 60;

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (!endTime) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-5 w-5" />
        <span className="text-base">Time remaining:</span>
      </div>
      <div className="flex items-center justify-center gap-4 md:gap-6">
        <NumberFlowGroup>
          <div className="text-center">
            <div className="bg-white/20 rounded-md md:rounded-lg px-2 py-2 md:px-4 md:py-3">
              <NumberFlow
                className="text-2xl md:text-3xl font-bold text-white"
                value={timeLeft.days}
              />
            </div>
            <div className="text-xs md:text-sm mt-1 md:mt-2">days</div>
          </div>
          
          <div className="text-center">
            <div className="bg-white/20 rounded-md md:rounded-lg px-2 py-2 md:px-4 md:py-3">
              <NumberFlow
                className="text-2xl md:text-3xl font-bold text-white"
                value={timeLeft.hours}
              />
            </div>
            <div className="text-xs md:text-sm mt-1 md:mt-2">hours</div>
          </div>
          
          <div className="text-center">
            <div className="bg-white/20 rounded-md md:rounded-lg px-2 py-2 md:px-4 md:py-3">
              <NumberFlow
                className="text-2xl md:text-3xl font-bold text-white"
                value={timeLeft.minutes}
              />
            </div>
            <div className="text-xs md:text-sm mt-1 md:mt-2">min</div>
          </div>
          
          <div className="text-center">
            <div className="bg-white/20 rounded-md md:rounded-lg px-2 py-2 md:px-4 md:py-3">
              <NumberFlow
                className="text-2xl md:text-3xl font-bold text-white"
                value={timeLeft.seconds}
              />
            </div>
            <div className="text-xs md:text-sm mt-1 md:mt-2">sec</div>
          </div>
        </NumberFlowGroup>
      </div>
    </div>
  );
}

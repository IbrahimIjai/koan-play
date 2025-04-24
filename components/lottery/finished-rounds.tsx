"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { LOTTERY_ABI } from "@/configs/abis";
import { CONTRACTS } from "@/configs/contracts-confg";
import { baseSepolia } from "viem/chains";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { getTokenByAddress } from "@/configs/token-list";

export default function FinishedRounds() {
  const { address, isConnected } = useAccount();
  const [currentViewRound, setCurrentViewRound] = useState<bigint | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "your">("all");

  // Add state for token info
  const [tokenSymbol, setTokenSymbol] = useState("TOKEN");
  const [tokenDecimals, setTokenDecimals] = useState(18);

  const { data: currentLotteryId } = useReadContract({
    address: CONTRACTS.LOTTERY.address[baseSepolia.id],
    abi: LOTTERY_ABI,
    functionName: "viewCurrentLotteryId",
  });

  // Add effect to get token info
  const { data: paymentTokenAddress } = useReadContract({
    address: CONTRACTS.LOTTERY.address[baseSepolia.id],
    abi: LOTTERY_ABI,
    functionName: "paymentToken",
  });

  useEffect(() => {
    if (paymentTokenAddress) {
      const tokenInfo = getTokenByAddress(
        baseSepolia.id,
        paymentTokenAddress as string,
      );
      if (tokenInfo) {
        setTokenSymbol(tokenInfo.symbol);
        setTokenDecimals(tokenInfo.decimals);
      }
    }
  }, [paymentTokenAddress]);

  // Set the current view round to the previous round when currentLotteryId is loaded
  useEffect(() => {
    if (currentLotteryId && currentLotteryId > 1n) {
      setCurrentViewRound(currentLotteryId - 1n);
    }
  }, [currentLotteryId]);

  const { data: roundInfo, isLoading: isLoadingRound } = useReadContract({
    address: CONTRACTS.LOTTERY.address[baseSepolia.id],
    abi: LOTTERY_ABI,
    functionName: "viewLottery",
    args: [currentViewRound || 0n],
    query: {
      enabled: currentViewRound !== null,
    },
  });

  const { data: userTickets, isLoading: isLoadingUserTickets } =
    useReadContract({
      address: CONTRACTS.LOTTERY.address[baseSepolia.id],
      abi: LOTTERY_ABI,
      functionName: "viewUserInfoForLotteryId",
      args: [address || "0x0", currentViewRound || 0n, 0n, 100n],
      query: {
        enabled:
          isConnected && currentViewRound !== null && activeTab === "your",
      },
    });

  const handlePrevRound = () => {
    if (currentViewRound && currentViewRound > 1n) {
      setCurrentViewRound(currentViewRound - 1n);
    }
  };

  const handleNextRound = () => {
    if (
      currentViewRound &&
      currentLotteryId &&
      currentViewRound < currentLotteryId - 1n
    ) {
      setCurrentViewRound(currentViewRound + 1n);
    }
  };

  const handleLatestRound = () => {
    if (currentLotteryId && currentLotteryId > 1n) {
      setCurrentViewRound(currentLotteryId - 1n);
    }
  };

  const isLoading =
    isLoadingRound || (isLoadingUserTickets && activeTab === "your");
  const hasUserTickets =
    userTickets && userTickets[0] && userTickets[0].length > 0;

  // Update the prize pool formatting
  const formattedPrizePool = roundInfo
    ? formatUnits(roundInfo.amountCollectedInPaymentToken, tokenDecimals)
    : "0.00";

  // Calculate total players (this is a placeholder - you'd need to get this from your contract)
  const totalPlayers = 88; // Placeholder value

  return (
    <Card className="border-2 border-purple-200 dark:border-purple-800/30 bg-white dark:bg-slate-900 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
        <CardTitle className="text-center">Finished Rounds</CardTitle>
      </CardHeader>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "all" | "your")}
        className="w-full"
      >
        <div className="px-6 pt-6">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800"
            >
              All History
            </TabsTrigger>
            <TabsTrigger
              value="your"
              className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800"
            >
              Your History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : roundInfo ? (
              <div className="space-y-6">
                {/* Round header with navigation */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">
                      Round{" "}
                      <span className="text-purple-600 dark:text-purple-400">
                        {currentViewRound?.toString()}
                      </span>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Drawn{" "}
                      {format(
                        new Date(Number(roundInfo.endTime) * 1000),
                        "MMM d, yyyy, h:mma",
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePrevRound}
                      disabled={!currentViewRound || currentViewRound <= 1n}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNextRound}
                      disabled={
                        !currentViewRound ||
                        !currentLotteryId ||
                        currentViewRound >= currentLotteryId - 1n
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleLatestRound}
                      disabled={
                        !currentViewRound ||
                        !currentLotteryId ||
                        currentViewRound >= currentLotteryId - 1n
                      }
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Winning number */}
                <div>
                  <h3 className="text-lg font-bold mb-3">Winning Number</h3>
                  <div className="flex gap-2 mb-2">
                    {roundInfo.finalNumber
                      .toString()
                      .padStart(6, "0")
                      .split("")
                      .map((digit, index) => (
                        <div
                          key={index}
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md"
                          style={{
                            backgroundColor: [
                              "#FF6B6B",
                              "#4ECDC4",
                              "#FFD166",
                              "#6A0572",
                              "#36D1DC",
                              "#5E60CE",
                            ][index],
                          }}
                        >
                          {digit}
                        </div>
                      ))}
                  </div>
                  {currentViewRound === currentLotteryId &&
                    currentLotteryId &&
                    currentLotteryId > 1n && (
                      <Badge className="bg-purple-500">Latest</Badge>
                    )}
                </div>

                {/* Prize pot */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold mb-2">Prize pot</h3>
                    {/* Update the prize pool display to use the token symbol */}
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formattedPrizePool} {tokenSymbol}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total players this round: {totalPlayers}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-2">
                      Match the winning number
                    </h3>
                    <p className="text-sm mb-4">
                      Match the winning number in the same order to share
                      prizes.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-purple-600 dark:text-purple-400">
                          Match first 1
                        </p>
                        {/* Update the rewards display to use the token symbol */}
                        <p className="font-bold">260 {tokenSymbol}</p>
                        <p className="text-xs text-muted-foreground">~$260</p>
                      </div>
                      <div>
                        <p className="font-medium text-purple-600 dark:text-purple-400">
                          Match first 2
                        </p>
                        {/* Update the rewards display to use the token symbol */}
                        <p className="font-bold">390 {tokenSymbol}</p>
                        <p className="text-xs text-muted-foreground">~$390</p>
                      </div>
                      <div>
                        <p className="font-medium text-purple-600 dark:text-purple-400">
                          Match first 3
                        </p>
                        {/* Update the rewards display to use the token symbol */}
                        <p className="font-bold">651 {tokenSymbol}</p>
                        <p className="text-xs text-muted-foreground">~$651</p>
                      </div>
                      <div>
                        <p className="font-medium text-purple-600 dark:text-purple-400">
                          Match first 4
                        </p>
                        {/* Update the rewards display to use the token symbol */}
                        <p className="font-bold">1,301 {tokenSymbol}</p>
                        <p className="text-xs text-muted-foreground">~$1,301</p>
                      </div>
                      <div>
                        <p className="font-medium text-purple-600 dark:text-purple-400">
                          Match first 5
                        </p>
                        {/* Update the rewards display to use the token symbol */}
                        <p className="font-bold">2,602 {tokenSymbol}</p>
                        <p className="text-xs text-muted-foreground">~$2,602</p>
                      </div>
                      <div>
                        <p className="font-medium text-purple-600 dark:text-purple-400">
                          Match all 6
                        </p>
                        {/* Update the rewards display to use the token symbol */}
                        <p className="font-bold">5,204 {tokenSymbol}</p>
                        <p className="text-xs text-muted-foreground">~$5,204</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p>No finished rounds available</p>
              </div>
            )}
          </CardContent>
        </TabsContent>

        <TabsContent value="your" className="mt-0">
          <CardContent className="p-6">
            {!isConnected ? (
              <div className="text-center py-12">
                <p className="mb-4">
                  Connect your wallet to view your lottery history
                </p>
                <Button>Connect Wallet</Button>
              </div>
            ) : isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : hasUserTickets ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">
                      Round{" "}
                      <span className="text-purple-600 dark:text-purple-400">
                        {currentViewRound?.toString()}
                      </span>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Drawn{" "}
                      {format(
                        new Date(Number(roundInfo?.endTime || 0) * 1000),
                        "MMM d, yyyy, h:mma",
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePrevRound}
                      disabled={!currentViewRound || currentViewRound <= 1n}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNextRound}
                      disabled={
                        !currentViewRound ||
                        !currentLotteryId ||
                        currentViewRound >= currentLotteryId - 1n
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleLatestRound}
                      disabled={
                        !currentViewRound ||
                        !currentLotteryId ||
                        currentViewRound >= currentLotteryId - 1n
                      }
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-3">Your Tickets</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {userTickets &&
                      userTickets[0] &&
                      userTickets[0].map((ticketId: bigint, index: number) => (
                        <div
                          key={ticketId.toString()}
                          className="border rounded-md p-3 bg-muted/30 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium">
                              #{ticketId.toString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {userTickets[1][index]
                                .toString()
                                .padStart(6, "0")}
                            </p>
                          </div>
                          {userTickets[2][index] ? (
                            <Badge
                              variant="outline"
                              className="border-purple-500 text-purple-600"
                            >
                              Claimed
                            </Badge>
                          ) : (
                            <Badge className="bg-purple-500">Active</Badge>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p>You have no tickets for this round</p>
              </div>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

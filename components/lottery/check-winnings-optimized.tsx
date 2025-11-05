"use client";

import { useState, useMemo, useCallback } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trophy, AlertCircle, Loader2, Gift, PartyPopper } from "lucide-react";
import { LOTTERY_ABI } from "@/configs/abis";
import { getSafeContractAddress } from "@/configs/contracts-confg";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ConnectButton from "@/components/connect-button";
import { getTokenByAddress } from "@/configs/token-list";
import { toast } from "sonner";

interface WinningTicket {
  id: bigint;
  number: number;
  bracket: number;
  reward: bigint;
  matchedDigits: number;
}

export default function CheckWinningsOptimized() {
  const { address, isConnected, chainId } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [winningTickets, setWinningTickets] = useState<WinningTicket[]>([]);
  const [hasChecked, setHasChecked] = useState(false);

  const lotteryAddress = getSafeContractAddress("LOTTERY", chainId);

  const { data: currentLotteryId, isError: isIdError } = useReadContract({
    address: lotteryAddress,
    abi: LOTTERY_ABI,
    functionName: "viewCurrentLotteryId",
    chainId,
    query: { enabled: !!lotteryAddress },
  });

  const previousLotteryId = useMemo(() => {
    if (!currentLotteryId || currentLotteryId === 0n) return null;
    return currentLotteryId - 1n;
  }, [currentLotteryId]);

  const {
    data: previousLotteryInfo,
    isLoading: isLoadingLottery,
    isError: isLotteryError,
  } = useReadContract({
    address: lotteryAddress,
    abi: LOTTERY_ABI,
    functionName: "viewLottery",
    args: [previousLotteryId || 0n],
    chainId,
    query: {
      enabled: !!lotteryAddress && previousLotteryId !== null && isOpen,
    },
  });

  const {
    data: userTickets,
    isLoading: isLoadingTickets,
    isError: isTicketsError,
  } = useReadContract({
    address: lotteryAddress,
    abi: LOTTERY_ABI,
    functionName: "viewUserInfoForLotteryId",
    args: [address || "0x0", previousLotteryId || 0n, 0n, 100n],
    chainId,
    query: {
      enabled:
        isConnected && !!lotteryAddress && previousLotteryId !== null && isOpen,
    },
  });

  const { data: paymentTokenAddress } = useReadContract({
    address: lotteryAddress,
    abi: LOTTERY_ABI,
    functionName: "paymentToken",
    chainId,
    query: { enabled: !!lotteryAddress },
  });

  const tokenInfo = useMemo(() => {
    if (!paymentTokenAddress || !chainId)
      return { symbol: "USDC", decimals: 6 };
    return (
      getTokenByAddress(chainId, paymentTokenAddress as string) || {
        symbol: "USDC",
        decimals: 6,
      }
    );
  }, [paymentTokenAddress, chainId]);

  const handleCheckWinnings = useCallback(async () => {
    if (
      !isConnected ||
      !previousLotteryInfo ||
      !userTickets ||
      !lotteryAddress
    ) {
      toast.error("Unable to check winnings", {
        description: "Missing required data",
      });
      return;
    }

    if (Number(previousLotteryInfo.status) !== 3) {
      toast.error("Lottery not claimable", {
        description: "The previous round hasn't been drawn yet",
      });
      return;
    }

    setIsChecking(true);
    setWinningTickets([]);

    try {
      const [ticketIds, ticketNumbers, ticketStatuses] = userTickets;
      const winningNumber = previousLotteryInfo.finalNumber;
      const winning: WinningTicket[] = [];

      // Check each ticket
      for (let i = 0; i < ticketIds.length; i++) {
        if (ticketStatuses[i]) continue; // Skip claimed tickets

        const ticketNumber = Number(ticketNumbers[i]);

        // Check each bracket from highest to lowest (5 to 0)
        for (let bracket = 5; bracket >= 0; bracket--) {
          // Calculate matched digits
          const powerOfTen = Math.pow(10, bracket + 1);
          const ticketMod = ticketNumber % powerOfTen;
          const winningMod = Number(winningNumber) % powerOfTen;

          if (ticketMod === winningMod) {
            const reward = previousLotteryInfo.rewardsPerBracket[bracket];

            if (reward > 0n) {
              winning.push({
                id: ticketIds[i],
                number: ticketNumber,
                bracket: bracket,
                reward: reward,
                matchedDigits: bracket + 1,
              });
              break; // Only count the highest matching bracket
            }
          }
        }
      }

      setWinningTickets(winning);
      setHasChecked(true);

      if (winning.length > 0) {
        toast.success("Congratulations! 🎉", {
          description: `You have ${winning.length} winning ticket${winning.length > 1 ? "s" : ""}!`,
        });
      } else {
        toast.info("No winning tickets", {
          description: "Better luck next time!",
        });
      }
    } catch (error) {
      console.error("Error checking winnings:", error);
      toast.error("Failed to check winnings", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsChecking(false);
    }
  }, [isConnected, previousLotteryInfo, userTickets, lotteryAddress]);

  const totalWinnings = useMemo(() => {
    return winningTickets.reduce((sum, ticket) => sum + ticket.reward, 0n);
  }, [winningTickets]);

  const formattedWinnings = useMemo(() => {
    return formatUnits(totalWinnings, tokenInfo.decimals);
  }, [totalWinnings, tokenInfo.decimals]);

  const hasNoPreviousLottery = !currentLotteryId || currentLotteryId <= 1n;
  const isPreviousRoundClaimable = Number(previousLotteryInfo?.status) === 3;
  const hasTickets = userTickets && userTickets[0].length > 0;

  if (!lotteryAddress) return null;

  return (
    <>
      <Button
        onClick={() => {
          setIsOpen(true);
          setHasChecked(false);
          setWinningTickets([]);
        }}
        variant="outline"
        className="w-full border-amber-500/30 hover:bg-amber-500/10"
        size="lg"
        disabled={hasNoPreviousLottery}
      >
        <Trophy className="mr-2 h-5 w-5 text-amber-500" />
        Check Previous Round Winnings
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Check Your Winnings
            </DialogTitle>
            <DialogDescription>
              {previousLotteryId !== null
                ? `Round #${previousLotteryId.toString()}`
                : "No previous round available"}
            </DialogDescription>
          </DialogHeader>

          {!isConnected ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
              <AlertCircle className="w-16 h-16 text-muted-foreground" />
              <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
              <p className="text-sm text-muted-foreground">
                You need to connect your wallet to check your winnings
              </p>
              <ConnectButton />
            </div>
          ) : isIdError || isLotteryError || isTicketsError ? (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>Error Loading Data</AlertTitle>
              <AlertDescription>
                Failed to load lottery information. Please try again later.
              </AlertDescription>
            </Alert>
          ) : isLoadingLottery || isLoadingTickets ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : !isPreviousRoundClaimable ? (
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>Round Not Ready</AlertTitle>
              <AlertDescription>
                The previous lottery round hasn&apos;t been drawn yet. Check
                back after the operator draws the winning numbers!
              </AlertDescription>
            </Alert>
          ) : !hasTickets ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
              <Gift className="w-16 h-16 text-muted-foreground" />
              <h3 className="text-xl font-semibold">No Tickets Found</h3>
              <p className="text-sm text-muted-foreground">
                You didn&apos;t participate in round #
                {previousLotteryId?.toString()}
              </p>
            </div>
          ) : isChecking ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />
              <h3 className="text-xl font-semibold">
                Checking your tickets...
              </h3>
              <p className="text-sm text-muted-foreground">
                Analyzing {userTickets[0].length} ticket
                {userTickets[0].length > 1 ? "s" : ""}
              </p>
            </div>
          ) : hasChecked ? (
            <AnimatePresence mode="wait">
              {winningTickets.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/30">
                    <PartyPopper className="w-16 h-16 text-amber-500 mb-4" />
                    <h3 className="text-2xl font-bold text-amber-500">
                      Congratulations! 🎉
                    </h3>
                    <p className="text-3xl font-bold mt-2">
                      {parseFloat(formattedWinnings).toLocaleString()}{" "}
                      {tokenInfo.symbol}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Total winnings from {winningTickets.length} winning ticket
                      {winningTickets.length > 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {winningTickets.map((ticket, index) => (
                      <Card key={index} className="border-amber-500/20">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-amber-500" />
                              Ticket #{ticket.id.toString()}
                            </span>
                            <Badge variant="secondary">
                              {ticket.matchedDigits} digits matched
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Number:
                            </span>
                            <span className="font-mono font-semibold">
                              {ticket.number.toString().padStart(7, "0")}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Prize:
                            </span>
                            <span className="font-semibold text-amber-600">
                              {parseFloat(
                                formatUnits(ticket.reward, tokenInfo.decimals),
                              ).toLocaleString()}{" "}
                              {tokenInfo.symbol}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Alert className="bg-blue-500/10 border-blue-500/30">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-sm">
                      Head to the claim section to collect your winnings!
                    </AlertDescription>
                  </Alert>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center p-8 space-y-4"
                >
                  <Gift className="w-16 h-16 text-muted-foreground" />
                  <h3 className="text-xl font-semibold">No Winning Tickets</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    None of your tickets won this round. Better luck next time!
                    🍀
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You checked {userTickets[0].length} ticket
                    {userTickets[0].length > 1 ? "s" : ""}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You have <strong>{userTickets[0].length}</strong> ticket
                  {userTickets[0].length > 1 ? "s" : ""} from round #
                  {previousLotteryId?.toString()}
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleCheckWinnings}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                size="lg"
              >
                <Trophy className="mr-2 h-5 w-5" />
                Check For Winnings
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

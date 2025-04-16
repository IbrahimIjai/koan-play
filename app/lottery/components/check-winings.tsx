"use client";

// import { useState } from "react";
// import { useAccount, useReadContract } from "wagmi";
// import { formatEther } from "viem";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Trophy, AlertCircle, Loader2 } from "lucide-react";
// import { LOTTERY_ABI } from "@/configs/abis";
// import { CONTRACTS } from "@/configs/contracts-confg";
// import { baseSepolia } from "viem/chains";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// // import { ConnectKitButton } from "connectkit";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { format } from "date-fns";
// import ConnectButton from "@/components/connect-button";

export default function CheckWinningsButton() {
  // const { address, isConnected } = useAccount();
  // const [isOpen, setIsOpen] = useState(false);
  // const [isChecking, setIsChecking] = useState(false);
  // const [winningTickets, setWinningTickets] = useState<any[]>([]);
  // const [hasChecked, setHasChecked] = useState(false);

  // const { data: currentLotteryId } = useReadContract({
  //   address: CONTRACTS.LOTTERY.address[baseSepolia.id],
  //   abi: LOTTERY_ABI,
  //   functionName: "viewCurrentLotteryId",
  // });

  // const { data: previousLotteryInfo } = useReadContract({
  //   address: CONTRACTS.LOTTERY.address[baseSepolia.id],
  //   abi: LOTTERY_ABI,
  //   functionName: "viewLottery",
  //   args: [currentLotteryId ? currentLotteryId - 1n : 0n],
  //   query: {
  //     enabled:
  //       currentLotteryId !== undefined && currentLotteryId > 1n && isOpen,
  //   },
  // });

  // const { data: userTickets } = useReadContract({
  //   address: CONTRACTS.LOTTERY.address[baseSepolia.id],
  //   abi: LOTTERY_ABI,
  //   functionName: "viewUserInfoForLotteryId",
  //   args: [
  //     address || "0x0",
  //     currentLotteryId ? currentLotteryId - 1n : 0n,
  //     0n,
  //     100n,
  //   ],
  //   query: {
  //     enabled:
  //       isConnected &&
  //       currentLotteryId !== undefined &&
  //       currentLotteryId > 1n &&
  //       isOpen,
  //   },
  // });

  // const handleCheckWinnings = async () => {
  //   if (
  //     !isConnected ||
  //     !previousLotteryInfo ||
  //     !userTickets ||
  //     previousLotteryInfo.status !== 3
  //   ) {
  //     return;
  //   }

  //   setIsChecking(true);
  //   setWinningTickets([]);

  //   try {
  //     const ticketIds = userTickets[0];
  //     const ticketNumbers = userTickets[1];
  //     const ticketStatuses = userTickets[2];
  //     const winningNumber = previousLotteryInfo.finalNumber;

  //     const winning: any[] = [];

  //     // Check each ticket
  //     for (let i = 0; i < ticketIds.length; i++) {
  //       if (ticketStatuses[i]) continue; // Skip claimed tickets

  //       // For each unclaimed ticket, check each bracket (0-5) for rewards
  //       for (let bracket = 0; bracket < 6; bracket++) {
  //         try {
  //           const reward = await window.ethereum.request({
  //             method: "eth_call",
  //             params: [
  //               {
  //                 to: CONTRACTS.LOTTERY.address[baseSepolia.id],
  //                 data: `0x${
  //                   // Function selector for viewRewardsForTicketId
  //                   "85a6b3ae" +
  //                   // lotteryId (padded to 32 bytes)
  //                   (currentLotteryId - 1).toString(16).padStart(64, "0") +
  //                   // ticketId (padded to 32 bytes)
  //                   ticketIds[i].toString(16).padStart(64, "0") +
  //                   // bracket (padded to 32 bytes)
  //                   bracket.toString(16).padStart(64, "0")
  //                 }`,
  //               },
  //               "latest",
  //             ],
  //           });

  //           const rewardBigInt = BigInt(reward);

  //           if (rewardBigInt > 0n) {
  //             winning.push({
  //               id: Number(ticketIds[i]),
  //               number: Number(ticketNumbers[i]),
  //               bracket: bracket,
  //               reward: rewardBigInt,
  //             });
  //             break; // Only add the highest bracket that matches
  //           }
  //         } catch (error) {
  //           console.error(`Error checking ticket ${ticketIds[i]}:`, error);
  //         }
  //       }
  //     }

  //     setWinningTickets(winning);
  //     setHasChecked(true);
  //   } catch (error) {
  //     console.error("Error checking winnings:", error);
  //   } finally {
  //     setIsChecking(false);
  //   }
  // };

  // const totalWinnings = winningTickets.reduce(
  //   (sum, ticket) => sum + ticket.reward,
  //   0n,
  // );
  // const formattedWinnings = formatEther(totalWinnings);

  // const isPreviousRoundClaimable = previousLotteryInfo?.status === 3;

  return (
    <>
      {/* <Button
        onClick={() => {
          setIsOpen(true);
          setHasChecked(false);
          setWinningTickets([]);
        }}
        variant="outline"
        className="w-full "
        size="lg"
        disabled={!currentLotteryId || currentLotteryId <= 1n}
      >
        <Trophy className="mr-2 h-5 w-5 text-amber-500" />
        Did you win previous round?
      </Button> */}

      {/* <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Check Your Winnings</DialogTitle>
            <DialogDescription>
              See if you won prizes in round #
              {(currentLotteryId ? currentLotteryId - 1n : 0n).toString()}
            </DialogDescription>
          </DialogHeader>

          {!isConnected ? (
            <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">Connect Your Wallet</h3>
              <p className="text-sm text-muted-foreground">
                You need to connect your wallet to check winnings
              </p>
              <ConnectButton />
            </div>
          ) : !isPreviousRoundClaimable ? (
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>Round Not Claimable</AlertTitle>
              <AlertDescription>
                The previous lottery round is not in a claimable state yet.
                Please check back later.
              </AlertDescription>
            </Alert>
          ) : isChecking ? (
            <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
              <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
              <h3 className="text-lg font-medium">Checking your tickets...</h3>
            </div>
          ) : hasChecked ? (
            <div className="py-4">
              {winningTickets.length > 0 ? (
                <>
                  <div className="text-center mb-6">
                    <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400">
                      Congratulations!
                    </h3>
                    <p className="text-lg">
                      You won{" "}
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {formattedWinnings} USDC
                      </span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Your winning tickets:</h4>
                    {winningTickets.map((ticket) => (
                      <Card
                        key={ticket.id}
                        className="border-amber-200 dark:border-amber-800/30"
                      >
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium">Ticket #{ticket.id}</p>
                            <p className="text-sm text-muted-foreground">
                              Number: {ticket.number}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-amber-500 mb-1">
                              {ticket.bracket + 1} matching
                            </Badge>
                            <p className="font-bold text-amber-600 dark:text-amber-400">
                              {formatEther(ticket.reward)} USDC
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-lg font-medium">No winning tickets</h3>
                  <p className="text-muted-foreground">
                    You didn't win any prizes in round #
                    {(currentLotteryId ? currentLotteryId - 1n : 0n).toString()}
                    . Better luck next time!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4">
              {previousLotteryInfo && (
                <div className="mb-6 text-center">
                  <h3 className="font-medium mb-1">Winning Number</h3>
                  <div className="flex justify-center gap-1">
                    {previousLotteryInfo.finalNumber
                      .toString()
                      .padStart(6, "0")
                      .split("")
                      .map((digit, index) => (
                        <div
                          key={index}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
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
                  <p className="text-sm text-muted-foreground mt-2">
                    Drawn on{" "}
                    {format(
                      new Date(Number(previousLotteryInfo.endTime) * 1000),
                      "MMM d, yyyy, h:mma 'GMT+1'",
                    )}
                  </p>
                </div>
              )}

              <div className="text-center">
                <p className="mb-4">
                  Check if you have any winning tickets from the previous round.
                  You can claim your prizes if you won!
                </p>
                <Button
                  onClick={handleCheckWinnings}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                >
                  Check My Tickets
                </Button>
              </div>
            </div>
          )}

          {hasChecked && winningTickets.length > 0 && (
            <DialogFooter>
              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                onClick={() => setIsOpen(false)}
              >
                Claim Prizes
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog> */}
    </>
  );
}

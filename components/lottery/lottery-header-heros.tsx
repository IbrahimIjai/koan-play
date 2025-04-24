"use client";

import { useEffect, useState } from "react";

import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { format } from "date-fns";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CONTRACTS } from "@/configs/contracts-confg";
import { baseSepolia } from "viem/chains";
import { LOTTERY_ABI } from "@/configs/abis";

import { getTokenByAddress } from "@/configs/token-list";
import BuyTicketDialog from "./buy-ticket-dialog";

export default function LotteryHeader() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { address, isConnected, chainId } = useAccount();
  console.log({ chainId });
  const {
    data: currentLotteryId,
    isLoading: isLoadingId,
    // isError: isIdError,
  } = useReadContract({
    address: CONTRACTS.LOTTERY.address[baseSepolia.id],
    abi: LOTTERY_ABI,
    functionName: "viewCurrentLotteryId",
    chainId,
  });

  const {
    data: lotteryInfo,
    isLoading: isLoadingInfo,
    // isError: isInfoError,
  } = useReadContract({
    address: CONTRACTS.LOTTERY.address[baseSepolia.id],
    abi: LOTTERY_ABI,
    functionName: "viewLottery",
    args: [currentLotteryId || 0n],
    chainId,
    query: {
      enabled: currentLotteryId !== undefined,
    },
  });

  const {
    data: userTickets,
    isLoading: isLoadingUserTickets,
    refetch: refetchUserLotteryInfo,
  } = useReadContract({
    address: CONTRACTS.LOTTERY.address[baseSepolia.id],
    abi: LOTTERY_ABI,
    functionName: "viewUserInfoForLotteryId",
    args: [address || "0x0", currentLotteryId || 0n, 0n, 100n],
    chainId,
    query: {
      enabled: isConnected && currentLotteryId !== undefined,
    },
  });

  console.log({ userTickets });

  const { data: paymentTokenAddress } = useReadContract({
    address: CONTRACTS.LOTTERY.address[baseSepolia.id],
    abi: LOTTERY_ABI,
    functionName: "paymentToken",
    chainId,
  });

  console.log({ paymentTokenAddress });

  // Add state for token info
  const [tokenSymbol, setTokenSymbol] = useState("USDC");
  const [tokenDecimals, setTokenDecimals] = useState(18);

  console.log({ tokenSymbol, tokenDecimals });
  // Add effect to get token info
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

  const isLoading = isLoadingId || isLoadingInfo || isLoadingUserTickets;

  // Format the draw time
  const formattedDrawTime = lotteryInfo?.endTime
    ? format(
        new Date(Number(lotteryInfo.endTime) * 1000),
        "do MMMM, yyyy, h:mma 'GMT+1'",
      )
    : "TBD";

  // Get user ticket count
  const userTicketCount =
    userTickets && userTickets[0] ? userTickets[0].length : 0;


  const prizePool = lotteryInfo
    ? formatUnits(lotteryInfo.amountCollectedInPaymentToken, tokenDecimals)
    : "0.00";

  return (
    <Card className="overflow-hidden ">
      {/* Round number banner */}
      <div className=" py-2 px-4 flex justify-between items-center border-b">
        <p className="text-white font-bold text-xs text-muted-foreground">
          #{currentLotteryId?.toString() || "..."}
        </p>
      </div>

      {isLoading ? (
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-5">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                Prize Pot
              </span>
              <Skeleton className="h-8 w-3/4" />
            </div>

            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-muted-foreground">
                Draw Time
              </span>
              <Skeleton className="h-6 w-3/4" />
            </div>

            {/* <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-full" /> */}
          </div>
        </CardContent>
      ) : (
        <>
          <CardContent className="p-6 space-y-6">
            {/* Prize pot */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  Prize Pot
                </span>
              </div>
              <h3 className="text-3xl font-bold text-primary">
                ${prizePool} {tokenSymbol}
              </h3>
            </div>

            {/* Draw time */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Draw Time
                </span>
              </div>
              <p className="font-medium">{formattedDrawTime}</p>

              {/* {ADD A COUNT DOWN TIMER COMPONENT} */}
            </div>

            {isConnected && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                  <span className="text-xs text-muted-foreground font-medium">
                    Your Tickets
                  </span>
                </div>
                <p className="font-medium">
                  {isConnected
                    ? userTicketCount > 0
                      ? `You have ${userTicketCount} ticket${userTicketCount !== 1 ? "s" : ""}`
                      : "You have no tickets yet"
                    : "Connect wallet to view"}
                </p>
              </div>
            )}
          </CardContent>
        </>
      )}
      <CardFooter className="p-6 pt-0">
        <BuyTicketDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          buttonClassName="w-4/5 mx-auto"
          refetchUserLotteryInfo={refetchUserLotteryInfo}
          buttonText={
            lotteryInfo && lotteryInfo.status === 1
              ? "Get Tickets"
              : lotteryInfo?.status === 0
                ? "Lottery Preparing"
                : lotteryInfo?.status === 2
                  ? "Drawing in Progress"
                  : "Lottery Finished"
          }
        />
      </CardFooter>
      {/* <BuyTicketDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} /> */}
    </Card>
  );
}

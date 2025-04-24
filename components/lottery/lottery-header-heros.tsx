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
    <>
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
          {/* Prize pot */}
          <div className="text-center">
            <p className="text-xs font-bold whitespace-nowrap">
              Koan play Prize Pot
            </p>
            <h3 className="text-3xl font-bold text-primary">
              ${prizePool} {tokenSymbol}
            </h3>
          </div>
        </>
      )}
      <div className="mx-auto w-fit">
        <BuyTicketDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          buttonClassName="w-4/5 mx-auto"
          refetchUserLotteryInfo={refetchUserLotteryInfo}
          variant="pulsing"
          enableTilt={true}
          tiltDuration="3s"
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
      </div>
    </>
  );
}

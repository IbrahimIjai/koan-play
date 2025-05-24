"use client";

import { useEffect, useState } from "react";

import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { Skeleton } from "@/components/ui/skeleton";
import { CONTRACTS } from "@/configs/contracts-confg";
import { base } from "viem/chains";
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
    address: CONTRACTS.LOTTERY.address[chainId || base.id],
    abi: LOTTERY_ABI,
    functionName: "viewCurrentLotteryId",
    chainId,
  });

  const {
    data: lotteryInfo,
    isLoading: isLoadingInfo,
    // isError: isInfoError,
  } = useReadContract({
    address: CONTRACTS.LOTTERY.address[chainId || base.id],
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
    address: CONTRACTS.LOTTERY.address[chainId || base.id],
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
    address: CONTRACTS.LOTTERY.address[chainId || base.id],
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
        chainId || base.id,
        paymentTokenAddress as string,
      );
      if (tokenInfo) {
        setTokenSymbol(tokenInfo.symbol);
        setTokenDecimals(tokenInfo.decimals);
      }
    }
  }, [paymentTokenAddress]);

  const isLoading = isLoadingId || isLoadingInfo || isLoadingUserTickets;


  const prizePool = lotteryInfo
    ? formatUnits(lotteryInfo.amountCollectedInPaymentToken, tokenDecimals)
    : "0.00";

  return (
    <div className="flex flex-col items-center space-y-10">
      {isLoading ? (
        <div className="flex flex-col items-center gap-5">
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            Prize Pot
          </span>
          <Skeleton className="h-8 w-3/4" />
        </div>
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
    </div>
  );
}

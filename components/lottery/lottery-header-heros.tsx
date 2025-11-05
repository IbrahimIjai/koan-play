"use client";

import { useState, useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { getSafeContractAddress } from "@/configs/contracts-confg";
import { LOTTERY_ABI } from "@/configs/abis";
import { getTokenByAddress } from "@/configs/token-list";
import BuyTicketDialog from "./buy-ticket-dialog";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

enum LotteryStatus {
  Pending = 0,
  Open = 1,
  Close = 2,
  Claimable = 3,
}

export default function LotteryHeader() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { address, isConnected, chainId } = useAccount();

  const lotteryAddress = getSafeContractAddress("LOTTERY", chainId);

  const {
    data: currentLotteryId,
    isLoading: isLoadingId,
    isError: isIdError,
  } = useReadContract({
    address: lotteryAddress,
    abi: LOTTERY_ABI,
    functionName: "viewCurrentLotteryId",
    chainId,
    query: {
      enabled: !!lotteryAddress,
    },
  });

  const {
    data: lotteryInfo,
    isLoading: isLoadingInfo,
    isError: isInfoError,
  } = useReadContract({
    address: lotteryAddress,
    abi: LOTTERY_ABI,
    functionName: "viewLottery",
    args: [currentLotteryId || 0n],
    chainId,
    query: {
      enabled: currentLotteryId !== undefined && !!lotteryAddress,
    },
  });

  const {
    data: userTickets,
    isLoading: isLoadingUserTickets,
    refetch: refetchUserLotteryInfo,
  } = useReadContract({
    address: lotteryAddress,
    abi: LOTTERY_ABI,
    functionName: "viewUserInfoForLotteryId",
    args: [address || "0x0", currentLotteryId || 0n, 0n, 100n],
    chainId,
    query: {
      enabled:
        isConnected && currentLotteryId !== undefined && !!lotteryAddress,
    },
  });

  const { data: paymentTokenAddress } = useReadContract({
    address: lotteryAddress,
    abi: LOTTERY_ABI,
    functionName: "paymentToken",
    chainId,
    query: {
      enabled: !!lotteryAddress,
    },
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

  const prizePool = useMemo(() => {
    if (!lotteryInfo) return "0.00";
    return formatUnits(
      lotteryInfo.amountCollectedInPaymentToken,
      tokenInfo.decimals,
    );
  }, [lotteryInfo, tokenInfo.decimals]);

  const buttonText = useMemo(() => {
    if (!lotteryInfo) return "Loading...";
    const status = Number(lotteryInfo.status);
    switch (status) {
      case LotteryStatus.Open:
        return "Get Tickets";
      case LotteryStatus.Pending:
        return "Lottery Preparing";
      case LotteryStatus.Close:
        return "Drawing in Progress";
      case LotteryStatus.Claimable:
        return "Lottery Finished";
      default:
        return "Unavailable";
    }
  }, [lotteryInfo]);

  const isLoading = isLoadingId || isLoadingInfo || isLoadingUserTickets;
  const hasError = isIdError || isInfoError;

  if (!lotteryAddress) {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Lottery contract not deployed on this network. Please switch to a
          supported network.
        </AlertDescription>
      </Alert>
    );
  }

  if (hasError) {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load lottery information. Please refresh the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-2xl mx-auto">
      {isLoading ? (
        <div className="flex flex-col items-center gap-4 w-full">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-10 w-40 mt-4" />
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-2"
          >
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Prize Pool
            </p>
            <motion.h2
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent"
            >
              {parseFloat(prizePool).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              {tokenInfo.symbol}
            </motion.h2>
            {userTickets && userTickets[0].length > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-muted-foreground"
              >
                You have{" "}
                <span className="font-semibold text-primary">
                  {userTickets[0].length}
                </span>{" "}
                ticket{userTickets[0].length !== 1 ? "s" : ""}
              </motion.p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="w-full flex justify-center"
          >
            <BuyTicketDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              buttonClassName="px-8 py-6 text-lg font-semibold"
              refetchUserLotteryInfo={refetchUserLotteryInfo}
              variant="pulsing"
              enableTilt={true}
              tiltDuration="3s"
              buttonText={buttonText}
            />
          </motion.div>
        </>
      )}
    </div>
  );
}

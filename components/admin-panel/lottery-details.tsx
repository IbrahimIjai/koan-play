"use client";

import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Clock, Trophy, Search, AlertCircle } from "lucide-react";
import { LOTTERY_ABI } from "@/configs/abis";
import { CONTRACTS } from "@/configs/contracts-confg";
import { baseSepolia } from "viem/chains";
import { getTokenByAddress } from "@/configs/token-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import LotteryActions from "./lottery-actions";
import LotteryCountdown from "./lottery-countdown";

interface LotteryDetailsProps {
  defaultLotteryId?: bigint;
}

export default function LotteryDetails({
  defaultLotteryId,
}: LotteryDetailsProps) {
  const [lotteryId, setLotteryId] = useState<bigint | undefined>(
    defaultLotteryId,
  );
  const [inputLotteryId, setInputLotteryId] = useState("");
  const [tokenInfo, setTokenInfo] = useState<{
    symbol: string;
    decimals: number;
  }>({
    symbol: "TOKEN",
    decimals: 18,
  });
  const [error, setError] = useState<string | null>(null);

  // Get current lottery ID if no default is provided
  const { data: currentLotteryId } = useReadContract({
    address: CONTRACTS.LOTTERY.address[baseSepolia.id],
    abi: LOTTERY_ABI,
    functionName: "viewCurrentLotteryId",
    query: {
      enabled: !defaultLotteryId,
    },
  });

  // Set lottery ID to current if no default provided
  useEffect(() => {
    if (!defaultLotteryId && currentLotteryId) {
      setLotteryId(currentLotteryId);
      setInputLotteryId(currentLotteryId.toString());
    }
  }, [currentLotteryId, defaultLotteryId]);

  // Get lottery info
  const { data: lotteryInfo, isLoading: isLoadingInfo } = useReadContract({
    address: CONTRACTS.LOTTERY.address[baseSepolia.id],
    abi: LOTTERY_ABI,
    functionName: "viewLottery",
    args: [lotteryId || 0n],
    query: {
      enabled: lotteryId !== undefined,
      meta: {
        onError: (err: unknown) => {
          console.error("Error fetching lottery info:", err);
          setError(
            "Failed to fetch lottery information. The lottery ID may not exist.",
          );
        },
      },
    },
  });

  // Get payment token
  const { data: paymentTokenAddress } = useReadContract({
    address: CONTRACTS.LOTTERY.address[baseSepolia.id],
    abi: LOTTERY_ABI,
    functionName: "paymentToken",
  });

  // Get token info
  useEffect(() => {
    if (paymentTokenAddress) {
      const tokenInfo = getTokenByAddress(
        baseSepolia.id,
        paymentTokenAddress as string,
      );
      if (tokenInfo) {
        setTokenInfo({
          symbol: tokenInfo.symbol,
          decimals: tokenInfo.decimals,
        });
      }
    }
  }, [paymentTokenAddress]);

  // Handle lottery ID search
  const handleSearch = () => {
    if (!inputLotteryId) return;

    const newId = BigInt(inputLotteryId);
    setLotteryId(newId);
    setError(null);
  };

  // Get status text
  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "Open";
      case 2:
        return "Closed";
      case 3:
        return "Claimable";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lottery Details</CardTitle>
          <CardDescription>View and manage lottery information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Lottery ID search */}
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Enter lottery ID"
                value={inputLotteryId}
                onChange={(e) => setInputLotteryId(e.target.value)}
                type="number"
                min="1"
              />
            </div>
            <Button onClick={handleSearch} variant="secondary">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Lottery info */}
          {isLoadingInfo ? (
            <Skeleton className="w-full h-[200px]" />
          ) : lotteryInfo ? (
            <>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-2">
                  Round #{lotteryId?.toString()} -{" "}
                  {getStatusText(Number(lotteryInfo.status))}
                </h3>

                {/* Countdown timer */}
                <LotteryCountdown
                  endTime={Number(lotteryInfo.endTime)}
                  status={Number(lotteryInfo.status)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-md">
                  <div className="flex items-center mb-2 space-x-2">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Prize Pool</h3>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatUnits(
                      lotteryInfo.amountCollectedInPaymentToken,
                      tokenInfo.decimals,
                    )}{" "}
                    {tokenInfo.symbol}
                  </p>
                </div>

                <div className="p-4 border rounded-md">
                  <div className="flex items-center mb-2 space-x-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <h3 className="text-sm font-medium">End Time</h3>
                  </div>
                  <p className="text-lg font-medium">
                    {new Date(
                      Number(lotteryInfo.endTime) * 1000,
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="p-4 border rounded-md">
                  <div className="flex items-center mb-2 space-x-2">
                    <Trophy className="w-5 h-5 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Final Number</h3>
                  </div>
                  <p className="text-2xl font-bold">
                    {lotteryInfo.finalNumber > 0n
                      ? lotteryInfo.finalNumber.toString()
                      : "Not Drawn"}
                  </p>
                </div>
              </div>

              {/* Lottery actions */}
              <LotteryActions
                lotteryId={lotteryId}
                lotteryStatus={Number(lotteryInfo.status)}
              />
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No lottery information available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

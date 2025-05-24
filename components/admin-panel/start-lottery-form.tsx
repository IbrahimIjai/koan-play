"use client";

import { useState, useEffect } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits } from "viem";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";
import { LOTTERY_ABI } from "@/configs/abis";
import { CONTRACTS } from "@/configs/contracts-confg";
import { base } from "viem/chains";
import { getChainName } from "@/configs/chain-names";
import { getTokenByAddress } from "@/configs/token-list";
import { toast } from "sonner";
import { useAccount } from "wagmi";

export default function StartLotteryForm() {
  const { chainId } = useAccount();

  // Calculate default end time (current time + 1 hour + 5 minutes)
  const getDefaultEndTime = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 65);
    return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM
  };

  const [startLotteryParams, setStartLotteryParams] = useState({
    endTime: getDefaultEndTime(),
    priceTicket: "0.1",
    discountDivisor: "500",
    rewardsBreakdown: [250, 375, 625, 1250, 2500, 5000],
    treasuryFee: "2000",
  });

  const [tokenInfo, setTokenInfo] = useState<{
    symbol: string;
    decimals: number;
  }>({
    symbol: "TOKEN",
    decimals: 18,
  });

  // Get payment token
  const { data: paymentTokenAddress } = useReadContract({
    address: CONTRACTS.LOTTERY.address[chainId || base.id],
    abi: LOTTERY_ABI,
    functionName: "paymentToken",
    chainId,
  });

  // Get token info
  useEffect(() => {
    if (paymentTokenAddress) {
      const tokenInfo = getTokenByAddress(
        chainId || base.id,
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

  // Start lottery
  const {
    data: startHash,
    writeContract: startLottery,
    isPending: isStarting,
  } = useWriteContract();
  const { isLoading: isStartLoading, isSuccess: isStartSuccess } =
    useWaitForTransactionReceipt({
      hash: startHash,
    });

  // Handle start lottery
  const handleStartLottery = () => {
    const now = Math.floor(Date.now() / 1000);
    const endTimeSeconds = Math.floor(
      new Date(startLotteryParams.endTime).getTime() / 1000,
    );

    if (endTimeSeconds <= now) {
      toast.error("Invalid end time", {
        description: "End time must be in the future",
      });
      return;
    }

    // Check if rewards breakdown sums to 10000
    const rewardsSum = startLotteryParams.rewardsBreakdown.reduce(
      (a, b) => a + b,
      0,
    );
    if (rewardsSum !== 10000) {
      toast.error("Invalid rewards breakdown", {
        description: `Rewards must sum to 10000. Current sum: ${rewardsSum}`,
      });
      return;
    }

    // Parse price with correct decimals
    const priceTicketInTokenUnits = parseUnits(
      startLotteryParams.priceTicket,
      tokenInfo.decimals,
    );

    startLottery({
      address: CONTRACTS.LOTTERY.address[chainId || base.id],
      abi: LOTTERY_ABI,
      functionName: "startLottery",
      args: [
        BigInt(endTimeSeconds),
        priceTicketInTokenUnits,
        BigInt(startLotteryParams.discountDivisor),
        startLotteryParams.rewardsBreakdown.map((r) => BigInt(r)) as [
          bigint,
          bigint,
          bigint,
          bigint,
          bigint,
          bigint,
        ],
        BigInt(startLotteryParams.treasuryFee),
      ],
    });
  };

  // Show success toast
  useEffect(() => {
    if (isStartSuccess) {
      // Get chain name using our utility
      const chainName = getChainName(chainId);
      
      toast.success(`Lottery started successfully on ${chainName}`, {
        description: `A new lottery round has been created on the ${chainName} network.`,
      });

      // Reset form after success
      setStartLotteryParams({
        ...startLotteryParams,
        endTime: "",
      });
    }
  }, [isStartSuccess, chainId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start New Lottery</CardTitle>
        <CardDescription>
          Configure parameters for the next lottery round
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="datetime-local"
            value={startLotteryParams.endTime}
            onChange={(e) =>
              setStartLotteryParams({
                ...startLotteryParams,
                endTime: e.target.value,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priceTicket">Ticket Price ({tokenInfo.symbol})</Label>
          <Input
            id="priceTicket"
            type="number"
            step="0.001"
            min="0.001"
            max="50"
            value={startLotteryParams.priceTicket}
            onChange={(e) =>
              setStartLotteryParams({
                ...startLotteryParams,
                priceTicket: e.target.value,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountDivisor">Discount Divisor</Label>
          <Input
            id="discountDivisor"
            type="number"
            min="300"
            value={startLotteryParams.discountDivisor}
            onChange={(e) =>
              setStartLotteryParams({
                ...startLotteryParams,
                discountDivisor: e.target.value,
              })
            }
          />
          <p className="text-xs text-muted-foreground">
            The smaller the divisor, the greater the discount for buying
            multiple tickets
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="treasuryFee">Treasury Fee (basis points)</Label>
          <Input
            id="treasuryFee"
            type="number"
            min="0"
            max="3000"
            value={startLotteryParams.treasuryFee}
            onChange={(e) =>
              setStartLotteryParams({
                ...startLotteryParams,
                treasuryFee: e.target.value,
              })
            }
          />
          <p className="text-xs text-muted-foreground">
            2000 = 20%, 500 = 5%, max 30%
          </p>
        </div>

        <div className="space-y-2">
          <Label>Rewards Breakdown (must sum to 10000)</Label>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {startLotteryParams.rewardsBreakdown.map((reward, index) => (
              <div key={index} className="space-y-1">
                <Label htmlFor={`reward-${index}`}>{index + 1} Matching</Label>
                <Input
                  id={`reward-${index}`}
                  type="number"
                  min="0"
                  max="10000"
                  value={reward}
                  onChange={(e) => {
                    const newRewards = [...startLotteryParams.rewardsBreakdown];
                    newRewards[index] = Number.parseInt(e.target.value);
                    setStartLotteryParams({
                      ...startLotteryParams,
                      rewardsBreakdown: newRewards,
                    });
                  }}
                />
              </div>
            ))}
          </div>
          <p
            className={`text-xs ${startLotteryParams.rewardsBreakdown.reduce((a, b) => a + b, 0) !== 10000 ? "text-red-500" : "text-muted-foreground"}`}
          >
            Total:{" "}
            {startLotteryParams.rewardsBreakdown.reduce((a, b) => a + b, 0)} /
            10000
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleStartLottery}
          disabled={isStarting || isStartLoading || !startLotteryParams.endTime}
          className="w-full"
        >
          {isStarting || isStartLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              {isStarting ? "Submitting..." : "Confirming..."}
            </>
          ) : (
            "Start New Lottery"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

"use client";

import { useEffect } from "react";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";
import { LOTTERY_ABI } from "@/configs/abis";
import { CONTRACTS } from "@/configs/contracts-confg";
import { baseSepolia } from "viem/chains";
import { toast } from "sonner";

interface LotteryActionsProps {
  lotteryId?: bigint;
  lotteryStatus: number;
}

export default function LotteryActions({
  lotteryId,
  lotteryStatus,
}: LotteryActionsProps) {
  const [autoInjection, setAutoInjection] = useState(true);

  // Close lottery
  const {
    data: closeHash,
    writeContract: closeLottery,
    isPending: isClosing,
    error: closeError,
  } = useWriteContract();
  const { isLoading: isCloseLoading, isSuccess: isCloseSuccess } =
    useWaitForTransactionReceipt({
      hash: closeHash,
    });

  // Draw final number
  const {
    data: drawHash,
    writeContract: drawFinalNumber,
    isPending: isDrawing,
    error: drawError,
  } = useWriteContract();
  const { isLoading: isDrawLoading, isSuccess: isDrawSuccess } =
    useWaitForTransactionReceipt({
      hash: drawHash,
    });

  // Handle close lottery
  const handleCloseLottery = () => {
    if (!lotteryId) return;

    closeLottery({
      address: CONTRACTS.LOTTERY.address[baseSepolia.id],
      abi: LOTTERY_ABI,
      functionName: "closeLottery",
      args: [lotteryId],
    });
  };

  // Handle draw final number
  const handleDrawFinalNumber = () => {
    if (!lotteryId) return;

    drawFinalNumber({
      address: CONTRACTS.LOTTERY.address[baseSepolia.id],
      abi: LOTTERY_ABI,
      functionName: "drawFinalNumberAndMakeLotteryClaimable",
      args: [lotteryId, autoInjection],
    });
  };

  // Transaction submitted toasts
  useEffect(() => {
    if (closeHash) {
      toast.info("Transaction submitted", {
        description: "Closing lottery. Waiting for confirmation...",
      });
    }
  }, [closeHash]);

  useEffect(() => {
    if (drawHash) {
      toast.info("Transaction submitted", {
        description: "Drawing final number. Waiting for confirmation...",
      });
    }
  }, [drawHash]);

  // Success toasts
  useEffect(() => {
    if (isCloseSuccess) {
      toast.success("Lottery closed successfully!", {
        description: `Lottery #${lotteryId?.toString()} has been closed. Ready to draw final number.`,
      });
    }
  }, [isCloseSuccess, lotteryId]);

  useEffect(() => {
    if (isDrawSuccess) {
      toast.success("Final number drawn successfully!", {
        description: `Lottery #${lotteryId?.toString()} is now claimable. Winners can claim prizes.`,
      });
    }
  }, [isDrawSuccess, lotteryId]);

  // Error toasts
  useEffect(() => {
    if (closeError) {
      toast.error("Failed to close lottery", {
        description:
          closeError.message || "An error occurred while closing the lottery",
      });
    }
  }, [closeError]);

  useEffect(() => {
    if (drawError) {
      toast.error("Failed to draw final number", {
        description:
          drawError.message ||
          "An error occurred while drawing the final number",
      });
    }
  }, [drawError]);

  // Determine button states
  const canClose = lotteryStatus === 1;
  const canDraw = lotteryStatus === 2;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Button
          onClick={handleCloseLottery}
          disabled={!canClose || isClosing || isCloseLoading}
          className="w-full"
        >
          {isClosing || isCloseLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              {isClosing ? "Submitting..." : "Confirming..."}
            </>
          ) : (
            "Close Lottery"
          )}
        </Button>

        <Button
          onClick={handleDrawFinalNumber}
          disabled={!canDraw || isDrawing || isDrawLoading}
          className="w-full"
        >
          {isDrawing || isDrawLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              {isDrawing ? "Submitting..." : "Confirming..."}
            </>
          ) : (
            "Draw Final Number"
          )}
        </Button>
      </div>

      {canDraw && (
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-injection"
            checked={autoInjection}
            onCheckedChange={setAutoInjection}
          />
          <Label htmlFor="auto-injection">
            Auto-inject treasury funds into next lottery
          </Label>
        </div>
      )}
    </div>
  );
}

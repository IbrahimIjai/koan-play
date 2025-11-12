"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";
import { LOTTERY_ABI } from "@/configs/abis";
import { CONTRACTS } from "@/configs/contracts-confg";
import { baseSepolia } from "viem/chains";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    reset: resetClose,
  } = useWriteContract({
    mutation: {
      onSuccess: () => {
        toast.info("Transaction submitted", {
          description: "Closing lottery. Waiting for confirmation...",
        });
      },
      onError: (err) => {
        toast.error("Failed to close lottery", {
          description: getReadableError(err),
        });
      },
    },
  });
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
    reset: resetDraw,
  } = useWriteContract({
    mutation: {
      onSuccess: () => {
        toast.info("Transaction submitted", {
          description: "Drawing final number. Waiting for confirmation...",
        });
      },
      onError: (err) => {
        toast.error("Failed to draw final number", {
          description: getReadableError(err),
        });
      },
    },
  });
  const { isLoading: isDrawLoading, isSuccess: isDrawSuccess } =
    useWaitForTransactionReceipt({
      hash: drawHash,
    });

  // Side-effects for receipt status (success / error) to display toasts once
  useEffect(() => {
    if (isCloseSuccess && closeHash) {
      toast.success("Lottery closed successfully!", {
        description: `Lottery #${lotteryId?.toString()} has been closed. Ready to draw final number.`,
      });
    }
  }, [isCloseSuccess, closeHash, lotteryId]);

  useEffect(() => {
    if (isDrawSuccess && drawHash) {
      toast.success("Final number drawn successfully!", {
        description: `Lottery #${lotteryId?.toString()} is now claimable. Winners can claim prizes.`,
      });
    }
  }, [isDrawSuccess, drawHash, lotteryId]);

  // Handle close lottery
  const handleCloseLottery = () => {
    if (!lotteryId) {
      toast.error("Missing lottery id", {
        description: "Cannot close: no lottery selected.",
      });
      return;
    }
    if (lotteryStatus !== 1) {
      toast.error("Lottery not open", {
        description: "You can only close an open lottery.",
      });
      return;
    }

    closeLottery({
      address: CONTRACTS.LOTTERY.address[baseSepolia.id],
      abi: LOTTERY_ABI,
      functionName: "closeLottery",
      args: [lotteryId],
    });
  };

  // Handle draw final number
  const handleDrawFinalNumber = () => {
    if (!lotteryId) {
      toast.error("Missing lottery id", {
        description: "Cannot draw: no lottery selected.",
      });
      return;
    }
    if (lotteryStatus !== 2) {
      toast.error("Lottery not closed", {
        description: "You can only draw once the lottery is closed.",
      });
      return;
    }

    drawFinalNumber({
      address: CONTRACTS.LOTTERY.address[baseSepolia.id],
      abi: LOTTERY_ABI,
      functionName: "drawFinalNumberAndMakeLotteryClaimable",
      args: [lotteryId, autoInjection],
    });
  };

  // Helper: human-friendly error message
  const getReadableError = (err: unknown) => {
    if (!err) return "Unknown error";
    const raw =
      typeof err === "object" && err !== null && "message" in err
        ? String((err as { message?: unknown }).message)
        : String(err);
    if (/User rejected|User denied|Rejected/.test(raw))
      return "You rejected the transaction";
    if (/insufficient funds/i.test(raw))
      return "Insufficient balance for gas or token payment";
    if (/execution reverted/i.test(raw))
      return raw.replace(
        /.*execution reverted:?\s?/i,
        "Transaction reverted: ",
      );
    return raw.length > 180 ? raw.slice(0, 180) + "…" : raw;
  };

  // Note: Toast side-effects handled in mutation/receipt callbacks above

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

      {/* Inline error banners with retry/actions */}
      {closeError && (
        <Alert variant="destructive">
          <AlertTitle>Failed to close lottery</AlertTitle>
          <AlertDescription className="mt-1">
            {getReadableError(closeError)}
          </AlertDescription>
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              onClick={handleCloseLottery}
              disabled={isClosing || isCloseLoading}
            >
              Retry
            </Button>
            <Button variant="ghost" onClick={() => resetClose()}>
              Dismiss
            </Button>
          </div>
        </Alert>
      )}

      {drawError && (
        <Alert variant="destructive">
          <AlertTitle>Failed to draw final number</AlertTitle>
          <AlertDescription className="mt-1">
            {getReadableError(drawError)}
          </AlertDescription>
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              onClick={handleDrawFinalNumber}
              disabled={isDrawing || isDrawLoading}
            >
              Retry
            </Button>
            <Button variant="ghost" onClick={() => resetDraw()}>
              Dismiss
            </Button>
          </div>
        </Alert>
      )}

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

"use client";

import { useState, useCallback, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatUnits, ReadContractErrorType } from "viem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Ticket,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  CopyCheck,
  CircleCheck,
} from "lucide-react";
import CopyToClipboard from "react-copy-to-clipboard";
import { LOTTERY_ABI } from "@/configs/abis";
import { CONTRACTS } from "@/configs/contracts-confg";
import { baseSepolia } from "viem/chains";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getTokenByAddress } from "@/configs/token-list";
import { erc20Abi } from "viem";
import ApprovalChecker from "@/components/checkers/approval";
import ConnectButton from "@/components/connect-button";
import { toast } from "sonner";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { PulsatingButton } from "../ui/pulsating-button";
import { cn } from "@/lib/utils";

interface BuyTicketDialogProps {
  open: boolean;
  refetchUserLotteryInfo?: (
    options?: RefetchOptions,
  ) => Promise<
    QueryObserverResult<
      readonly [
        readonly bigint[],
        readonly number[],
        readonly boolean[],
        bigint,
      ],
      ReadContractErrorType
    >
  >;
  onOpenChange: (open: boolean) => void;
  buttonClassName?: string;
  buttonText?: string;
  variant?: "default" | "pulsing";
  pulseColor?: string;
  pulseDuration?: string;
  enableTilt?: boolean;
  tiltDuration?: string;
}

export default function BuyTicketDialog({
  open,
  onOpenChange,
  variant = "default",
  pulseColor,
  pulseDuration,
  refetchUserLotteryInfo,
  buttonClassName = "",
  buttonText = "Get Tickets",
  enableTilt = false,
  tiltDuration = "2s",
}: BuyTicketDialogProps) {
  const { address, isConnected } = useAccount();
  const [ticketNumbers, setTicketNumbers] = useState<string>("");

  const [ticketsCopied, setTicketsCopied] = useState(false);
  const [ticketCount, setTicketCount] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [purchasedTickets, setPurchasedTickets] = useState<number[]>([]);

  // Add state for token info
  const [tokenSymbol, setTokenSymbol] = useState("TOKEN");
  const [tokenDecimals, setTokenDecimals] = useState(18);

  const { data: currentLotteryId } = useReadContract({
    address: CONTRACTS.LOTTERY.address[baseSepolia.id],
    abi: LOTTERY_ABI,
    functionName: "viewCurrentLotteryId",
  });

  const { data: lotteryInfo } = useReadContract({
    address: CONTRACTS.LOTTERY.address[baseSepolia.id],
    abi: LOTTERY_ABI,
    functionName: "viewLottery",
    args: [currentLotteryId || 0n],
    query: { enabled: currentLotteryId !== undefined && open },
  });

  const { data: paymentTokenAddress } = useReadContract({
    address: CONTRACTS.LOTTERY.address[baseSepolia.id],
    abi: LOTTERY_ABI,
    functionName: "paymentToken",
  });

  const { data: balance } = useReadContract({
    address: paymentTokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address || "0x0"],
    query: { enabled: isConnected && open && Boolean(paymentTokenAddress) },
  });

  const {
    data: buyHash,
    writeContract: buyTickets,
    isPending: isBuying,
    isSuccess: isSubmitted,
    reset,
  } = useWriteContract();

  const { isLoading: isBuyLoading, isSuccess: isTransactionSuccess } =
    useWaitForTransactionReceipt({
      hash: buyHash,
    });

  console.log({ isTransactionSuccess, isSubmitted });

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

  // Effect to handle transaction success
  useEffect(() => {
    if (isTransactionSuccess) {
      // Simulate getting ticket IDs from the transaction
      const ticketIds = ticketNumbers
        .split(",")
        .map((num) => Number.parseInt(num.trim()));
      setPurchasedTickets(ticketIds);

      // Show success toast
      toast.success("Tickets purchased successfully!", {
        description: `You've purchased ${ticketCount} ticket${ticketCount !== 1 ? "s" : ""}.`,
        duration: 5000,
      });
    }
  }, [isTransactionSuccess, ticketCount, ticketNumbers]);

  const handleBuyTickets = () => {
    if (!currentLotteryId || !ticketNumbers) return;

    const numbers = ticketNumbers
      .split(",")
      .map((num) => Number.parseInt(num.trim()));

    buyTickets({
      address: CONTRACTS.LOTTERY.address[baseSepolia.id],
      abi: LOTTERY_ABI,
      functionName: "buyTickets",
      args: [currentLotteryId, numbers],
    });
  };

  const generateRandomTickets = useCallback(() => {
    setIsGenerating(true);

    const numbers: number[] = [];
    for (let i = 0; i < ticketCount; i++) {
      // Generate a random 6-digit number between 1000000 and 1999999
      const randomNum = 1000000 + Math.floor(Math.random() * 1000000);
      numbers.push(randomNum);
    }

    setTicketNumbers(numbers.join(", "));
    setIsGenerating(false);
  }, [ticketCount]);

  const calculateTotalCost = (price: bigint, count: bigint) => {
    if (!lotteryInfo) return 0n;

    const discountDivisor = lotteryInfo.discountDivisor;
    return (price * count * (discountDivisor + 1n - count)) / discountDivisor;
  };

  const hasEnoughBalance = () => {
    if (!lotteryInfo || !balance) return false;

    const ticketPrice = lotteryInfo.priceTicketInPaymentToken;
    const totalCost = calculateTotalCost(ticketPrice, BigInt(ticketCount));

    return balance >= totalCost;
  };

  const isLotteryOpen = lotteryInfo?.status === 1;

  // Get ticket price and total price
  const ticketPrice = lotteryInfo
    ? formatUnits(lotteryInfo.priceTicketInPaymentToken, tokenDecimals)
    : "0";
  const totalCostBigInt = lotteryInfo
    ? calculateTotalCost(
        lotteryInfo.priceTicketInPaymentToken,
        BigInt(ticketCount),
      )
    : 0n;

  const totalPrice = formatUnits(totalCostBigInt, tokenDecimals);

  // Handle dialog close and reset
  const handleCloseDialog = () => {
    if (!isBuying && !isBuyLoading) {
      onOpenChange(false);
      // Reset states if transaction is complete
      if (isTransactionSuccess) {
        setTimeout(() => {
          reset();
          setPurchasedTickets([]);
          setTicketNumbers("");
          setTicketCount(1);
          refetchUserLotteryInfo?.();
        }, 300);
      }
    }
  };

  // Button to open the dialog
  const OpenDialogButton = () => {
    const disabled =
      !isLotteryOpen || !currentLotteryId || currentLotteryId === 0n;
    const statusTag = !isLotteryOpen &&
      currentLotteryId &&
      currentLotteryId > 0n && (
        <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
          {lotteryInfo?.status === 0
            ? "Preparing"
            : lotteryInfo?.status === 2
              ? "Processing"
              : lotteryInfo?.status === 3
                ? "Claimable"
                : "Unavailable"}
        </span>
      );

    // Content inside the button
    const buttonContent = (
      <div className="flex items-center gap-2">
        <Ticket className="mr-2 h-5 w-5" />
        {buttonText}
        {statusTag}
      </div>
    );

    // Return either a pulsing button or a normal button based on the variant prop
    if (variant === "pulsing") {
      return (
        <PulsatingButton  
          className={cn(buttonClassName, "size-lg w-fit")}
          onClick={() => onOpenChange(true)}
          disabled={disabled}
          pulseColor={pulseColor}
          duration={pulseDuration}
          enableTilt={enableTilt}
          tiltDuration={tiltDuration}
        >
          {buttonContent}
        </PulsatingButton>
      );
    }

    return (
      <Button
        className={buttonClassName}
        size="lg"
        onClick={() => onOpenChange(true)}
        disabled={disabled}
      >
        {buttonContent}
      </Button>
    );
  };

  // Render transaction status UI
  const renderTransactionStatus = () => {
    if (isBuying && !isBuyLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
          <RefreshCw className="w-16 h-16 text-emerald-500 animate-spin" />
          <h3 className="text-xl font-medium">Submitting Transaction</h3>
          <p className="text-muted-foreground">
            Please confirm the transaction in your wallet...
          </p>
        </div>
      );
    }

    if (!isBuying && isBuyLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
          <RefreshCw className="w-16 h-16 text-amber-500 animate-spin" />
          <h3 className="text-xl font-medium">Confirming Transaction</h3>
          <p className="text-muted-foreground">
            Your transaction is being confirmed on the blockchain...
          </p>
        </div>
      );
    }

    if (isTransactionSuccess && purchasedTickets.length > 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 space-y-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          <div>
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              Success!
            </h3>
            <p className="text-lg">
              You&apos;ve purchased {purchasedTickets.length} ticket
              {purchasedTickets.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="w-full max-w-md bg-muted/30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Your Ticket IDs</h4>
              {ticketsCopied ? (
                <>
                  <Button variant="outline" size="sm">
                    <CircleCheck
                      className=" h-3 w-3 cursor-pointer ml-2 sm:ml-0"
                      aria-hidden="true"
                    />
                    <span className=" whitespace-nowrap text-xs text-muted-foreground">
                      Copied ticket Ids
                    </span>
                  </Button>
                </>
              ) : (
                <CopyToClipboard
                  text={purchasedTickets.join(", ")}
                  onCopy={() => {
                    setTicketsCopied(true);
                    setTimeout(() => {
                      setTicketsCopied(false);
                    }, 800);
                  }}
                >
                  <div className="btn-sm !rounded-xl flex gap-3 py-3">
                    <CopyCheck
                      className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                      aria-hidden="true"
                    />
                    <span className=" whitespace-nowrap text-xs text-muted-foreground">
                      Copy Ticket Ids
                    </span>
                  </div>
                </CopyToClipboard>
              )}
            </div>
            <div className="text-left font-mono text-sm bg-background p-3 rounded border">
              {purchasedTickets.slice(0, 5).map((id, index) => (
                <div key={index} className="mb-1">
                  #{id}
                </div>
              ))}
              {purchasedTickets.length > 5 && (
                <div className="text-muted-foreground">
                  ...and {purchasedTickets.length - 5} more
                </div>
              )}
            </div>
          </div>
          <Button onClick={handleCloseDialog} className="mt-4 w-full">
            Close
          </Button>
        </div>
      );
    }

    return null;
  };

  const showTransactionUI =
    isBuying ||
    isBuyLoading ||
    (isTransactionSuccess && purchasedTickets.length > 0);

  return (
    <>
      <OpenDialogButton />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Buy Lottery Tickets</DialogTitle>
            <DialogDescription>
              Purchase tickets for the current lottery round. Each ticket costs{" "}
              {ticketPrice} {tokenSymbol}.
            </DialogDescription>
          </DialogHeader>

          {!isConnected ? (
            <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">Connect Your Wallet</h3>
              <p className="text-sm text-muted-foreground">
                You need to connect your wallet to buy lottery tickets
              </p>
              <ConnectButton />
            </div>
          ) : !isLotteryOpen ? (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>Lottery Not Open</AlertTitle>
              <AlertDescription>
                The current lottery round is not open for ticket purchases.
                Please wait for the next round to start.
              </AlertDescription>
            </Alert>
          ) : showTransactionUI ? (
            renderTransactionStatus()
          ) : (
            <>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="ticketCount">Number of Tickets</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="ticketCount"
                      type="number"
                      min="1"
                      max="100"
                      value={ticketCount}
                      onChange={(e) =>
                        setTicketCount(Number.parseInt(e.target.value) || 1)
                      }
                      disabled={isBuying || isBuyLoading}
                    />
                    <Button
                      variant="outline"
                      onClick={generateRandomTickets}
                      disabled={isBuying || isBuyLoading || isGenerating}
                    >
                      {isGenerating ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Generate
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Buying multiple tickets gives you a discount!
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticketNumbers">
                    Ticket Numbers (comma separated)
                  </Label>
                  <Input
                    id="ticketNumbers"
                    placeholder="1234567, 1234568, 1234569"
                    value={ticketNumbers}
                    onChange={(e) => setTicketNumbers(e.target.value)}
                    disabled={isBuying || isBuyLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Each number must be between 1000000 and 1999999
                  </p>
                </div>

                <div className="p-4 border rounded-md bg-muted/50">
                  <div className="flex justify-between">
                    <span>Price per ticket:</span>
                    <span>
                      {ticketPrice} {tokenSymbol}
                    </span>
                  </div>
                  <div className="flex justify-between mt-2 font-bold">
                    <span>Total cost:</span>
                    <span>
                      {totalPrice} {tokenSymbol}
                    </span>
                  </div>
                </div>

                {!hasEnoughBalance() && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertTitle>Insufficient Balance</AlertTitle>
                    <AlertDescription>
                      You don&apos;t have enough {tokenSymbol} to purchase these
                      tickets.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <DialogFooter>
                <ApprovalChecker
                  userAddress={address}
                  tokenAddress={paymentTokenAddress as `0x${string}`}
                  spenderAddress={CONTRACTS.LOTTERY.address[baseSepolia.id]}
                  amount={totalCostBigInt}
                  chainId={baseSepolia.id}
                  tokenSymbol={tokenSymbol}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  disabled={!hasEnoughBalance()}
                >
                  <Button
                    onClick={handleBuyTickets}
                    disabled={
                      isBuying ||
                      isBuyLoading ||
                      !ticketNumbers ||
                      !hasEnoughBalance()
                    }
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  >
                    {isBuying || isBuyLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Buying...
                      </>
                    ) : (
                      <>
                        <Ticket className="w-4 h-4 mr-2" />
                        Buy Tickets
                      </>
                    )}
                  </Button>
                </ApprovalChecker>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

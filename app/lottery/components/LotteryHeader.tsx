"use client";

import { useEffect, useState } from "react";
//  useCallback,
import {
  useAccount,
  useReadContract,
  // useWaitForTransactionReceipt,
  // useWriteContract,
} from "wagmi";
import { formatUnits } from "viem";
// erc20Abi,
import { format } from "date-fns";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
// import { Ticket } from "lucide-react";
// AlertCircle, RefreshCw,
import { Skeleton } from "@/components/ui/skeleton";
import { CONTRACTS } from "@/configs/contracts-confg";
import { baseSepolia } from "viem/chains";
import { LOTTERY_ABI } from "@/configs/abis";
// import ConnectButton from "@/components/connect-button";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Button } from "@/components/ui/button";
import { getTokenByAddress } from "@/configs/token-list";
import BuyTicketDialog from "./buy-ticket-dialog";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";

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
    chainId
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

  // Format prize pool
  // const prizePool = lotteryInfo
  //   ? Number(
  //       formatEther(lotteryInfo.amountCollectedInPaymentToken),
  //     ).toLocaleString(undefined, {
  //       maximumFractionDigits: 2,
  //     })
  //   : "0.00";

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

// interface BuyTicketDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// function BuyTicketDialog({ open, onOpenChange }: BuyTicketDialogProps) {
//   const { address, isConnected } = useAccount();
//   const [ticketNumbers, setTicketNumbers] = useState<string>("");
//   const [ticketCount, setTicketCount] = useState<number>(1);
//   const [isGenerating, setIsGenerating] = useState(false);

//   const { data: currentLotteryId } = useReadContract({
//     address: CONTRACTS.LOTTERY.address[baseSepolia.id],
//     abi: LOTTERY_ABI,
//     functionName: "viewCurrentLotteryId",
//   });

//   const { data: lotteryInfo } = useReadContract({
//     address: CONTRACTS.LOTTERY.address[baseSepolia.id],
//     abi: LOTTERY_ABI,
//     functionName: "viewLottery",
//     args: [currentLotteryId || 0n],
//     query: {
//       enabled: currentLotteryId !== undefined && open,
//     },
//   });

//   const { data: allowance } = useReadContract({
//     address: CONTRACTS.PAYMENT_TOKEN.address[baseSepolia.id],
//     abi: erc20Abi,
//     functionName: "allowance",
//     args: [address || "0x0", CONTRACTS.LOTTERY.address[baseSepolia.id]],
//     query: {
//       enabled: !!(isConnected && open),
//     },
//   });

//   const { data: balance } = useReadContract({
//     address: CONTRACTS.PAYMENT_TOKEN.address[baseSepolia.id],
//     abi: erc20Abi,
//     functionName: "balanceOf",
//     args: [address || "0x0"],
//     query: {
//       enabled: !!(isConnected && open),
//     },
//   });

//   console.log({ balance });

//   const {
//     data: approveHash,
//     writeContract: approve,
//     isPending: isApproving,
//   } = useWriteContract();

//   const {
//     data: buyHash,
//     writeContract: buyTickets,
//     isPending: isBuying,
//   } = useWriteContract();

//   const { isLoading: isApproveLoading } = useWaitForTransactionReceipt({
//     hash: approveHash,
//   });

//   const { isLoading: isBuyLoading } = useWaitForTransactionReceipt({
//     hash: buyHash,
//   });

//   const isLoading = isApproving || isBuying || isApproveLoading || isBuyLoading;

//   const handleApprove = () => {
//     if (!lotteryInfo) return;

//     const ticketPrice = lotteryInfo.priceTicketInPaymentToken;
//     const totalCost = calculateTotalCost(ticketPrice, BigInt(ticketCount));

//     approve({
//       address: CONTRACTS.PAYMENT_TOKEN.address[baseSepolia.id],
//       abi: erc20Abi,
//       functionName: "approve",
//       args: [CONTRACTS.LOTTERY.address[baseSepolia.id], totalCost],
//     });
//   };

//   const handleBuyTickets = () => {
//     if (!currentLotteryId || !ticketNumbers) return;

//     const numbers = ticketNumbers
//       .split(",")
//       .map((num) => Number.parseInt(num.trim()));

//     buyTickets({
//       address: CONTRACTS.LOTTERY.address[baseSepolia.id],
//       abi: LOTTERY_ABI,
//       functionName: "buyTickets",
//       args: [currentLotteryId, numbers],
//       // query: {
//       //   onSuccess: () => {
//       //     onOpenChange(false);
//       //     setTicketNumbers("");
//       //     setTicketCount(1);
//       //   },
//       // },
//     });
//   };

//   const generateRandomTickets = useCallback(() => {
//     setIsGenerating(true);

//     const numbers: number[] = [];
//     for (let i = 0; i < ticketCount; i++) {
//       // Generate a random 6-digit number between 1000000 and 1999999
//       const randomNum = 1000000 + Math.floor(Math.random() * 1000000);
//       numbers.push(randomNum);
//     }

//     setTicketNumbers(numbers.join(", "));
//     setIsGenerating(false);
//   }, [ticketCount]);

//   const calculateTotalCost = (price: bigint, count: bigint) => {
//     if (!lotteryInfo) return 0n;

//     const discountDivisor = lotteryInfo.discountDivisor;
//     return (price * count * (discountDivisor + 1n - count)) / discountDivisor;
//   };

//   const needsApproval = () => {
//     if (!lotteryInfo || !allowance) return true;

//     const ticketPrice = lotteryInfo.priceTicketInPaymentToken;
//     const totalCost = calculateTotalCost(ticketPrice, BigInt(ticketCount));

//     return allowance < totalCost;
//   };

//   const hasEnoughBalance = () => {
//     if (!lotteryInfo || !balance) return false;

//     const ticketPrice = lotteryInfo.priceTicketInPaymentToken;

//     console.log({ ticketPrice });

//     const totalCost = calculateTotalCost(ticketPrice, BigInt(ticketCount));

//     return balance >= totalCost;
//   };

//   const isLotteryOpen = lotteryInfo?.status === 1;

//   // Get ticket price and total price
//   const ticketPrice = lotteryInfo
//     ? formatEther(lotteryInfo.priceTicketInPaymentToken)
//     : "0";
//   const totalPrice = lotteryInfo
//     ? formatEther(
//         calculateTotalCost(
//           lotteryInfo.priceTicketInPaymentToken,
//           BigInt(ticketCount),
//         ),
//       )
//     : "0";

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[500px]">
//         <DialogHeader>
//           <DialogTitle>Buy Lottery Tickets</DialogTitle>
//           <DialogDescription>
//             Purchase tickets for the current lottery round. Each ticket costs{" "}
//             {ticketPrice} USDC.
//           </DialogDescription>
//         </DialogHeader>

//         {!isConnected ? (
//           <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
//             <AlertCircle className="w-12 h-12 text-muted-foreground" />
//             <h3 className="text-lg font-medium">Connect Your Wallet</h3>
//             <p className="text-sm text-muted-foreground">
//               You need to connect your wallet to buy lottery tickets
//             </p>
//             <ConnectButton />
//           </div>
//         ) : !isLotteryOpen ? (
//           <Alert variant="destructive">
//             <AlertCircle className="w-4 h-4" />
//             <AlertTitle>Lottery Not Open</AlertTitle>
//             <AlertDescription>
//               The current lottery round is not open for ticket purchases. Please
//               wait for the next round to start.
//             </AlertDescription>
//           </Alert>
//         ) : (
//           <>
//             <div className="grid gap-4 py-4">
//               <div className="space-y-2">
//                 <Label htmlFor="ticketCount">Number of Tickets</Label>
//                 <div className="flex space-x-2">
//                   <Input
//                     id="ticketCount"
//                     type="number"
//                     min="1"
//                     max="100"
//                     value={ticketCount}
//                     onChange={(e) =>
//                       setTicketCount(Number.parseInt(e.target.value) || 1)
//                     }
//                     disabled={isLoading}
//                   />
//                   <Button
//                     variant="outline"
//                     onClick={generateRandomTickets}
//                     disabled={isLoading || isGenerating}
//                   >
//                     {isGenerating ? (
//                       <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
//                     ) : (
//                       <RefreshCw className="w-4 h-4 mr-2" />
//                     )}
//                     Generate
//                   </Button>
//                 </div>
//                 <p className="text-xs text-muted-foreground">
//                   Buying multiple tickets gives you a discount!
//                 </p>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="ticketNumbers">
//                   Ticket Numbers (comma separated)
//                 </Label>
//                 <Input
//                   id="ticketNumbers"
//                   placeholder="1234567, 1234568, 1234569"
//                   value={ticketNumbers}
//                   onChange={(e) => setTicketNumbers(e.target.value)}
//                   disabled={isLoading}
//                 />
//                 <p className="text-xs text-muted-foreground">
//                   Each number must be between 1000000 and 1999999
//                 </p>
//               </div>

//               <div className="p-4 border rounded-md bg-muted/50">
//                 <div className="flex justify-between">
//                   <span>Price per ticket:</span>
//                   <span>{ticketPrice} USDC</span>
//                 </div>
//                 <div className="flex justify-between mt-2 font-bold">
//                   <span>Total cost:</span>
//                   <span>{totalPrice} USDC</span>
//                 </div>
//               </div>

//               {!hasEnoughBalance() && (
//                 <Alert variant="destructive">
//                   <AlertCircle className="w-4 h-4" />
//                   <AlertTitle>Insufficient Balance</AlertTitle>
//                   <AlertDescription>
//                     You don&apos;t have enough USDC to purchase these tickets.
//                   </AlertDescription>
//                 </Alert>
//               )}
//             </div>

//             <DialogFooter>
//               {needsApproval() ? (
//                 <Button
//                   onClick={handleApprove}
//                   disabled={isLoading || !hasEnoughBalance()}
//                   className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
//                 >
//                   {isApproving || isApproveLoading ? (
//                     <>
//                       <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
//                       Approving...
//                     </>
//                   ) : (
//                     "Approve USDC"
//                   )}
//                 </Button>
//               ) : (
//                 <Button
//                   onClick={handleBuyTickets}
//                   disabled={isLoading || !ticketNumbers || !hasEnoughBalance()}
//                   className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
//                 >
//                   {isBuying || isBuyLoading ? (
//                     <>
//                       <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
//                       Buying...
//                     </>
//                   ) : (
//                     <>
//                       <Ticket className="w-4 h-4 mr-2" />
//                       Buy Tickets
//                     </>
//                   )}
//                 </Button>
//               )}
//             </DialogFooter>
//           </>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }

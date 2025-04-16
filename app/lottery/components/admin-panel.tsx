"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { RefreshCw, Clock, Trophy, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Address, formatEther, formatUnits, parseUnits } from "viem";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { baseSepolia } from "viem/chains";
import { LOTTERY_ABI, RANDOMNUMBER_GENERATOR_ABI } from "@/configs/abis";
import { CONTRACTS } from "@/configs/contracts-confg";
import { Switch } from "@/components/ui/switch";
import { getTokenByAddress } from "@/configs/token-list";

export default function AdminPanel() {
  const [startLotteryParams, setStartLotteryParams] = useState({
    endTime: "",
    priceTicket: "0.1",
    discountDivisor: "500",
    rewardsBreakdown: [250, 375, 625, 1250, 2500, 5000],
    treasuryFee: "2000",
  });
  const [keyHash, setKeyHash] = useState("");
  const [operatorAddress, setOperatorAddress] = useState("");
  const [treasuryAddress, setTreasuryAddress] = useState("");
  const [injectorAddress, setInjectorAddress] = useState("");
  const [autoInjection, setAutoInjection] = useState(true);
  const [paymentTokenInfo, setPaymentTokenInfo] = useState<{
    address: string;
    decimals: number;
    symbol: string;
  } | null>(null);

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
    query: {
      enabled: currentLotteryId !== undefined,
    },
  });

  const {
    data: startHash,
    writeContract: startLottery,
    isPending: isStarting,
  } = useWriteContract();

  const {
    data: closeHash,
    writeContract: closeLottery,
    isPending: isClosing,
  } = useWriteContract();

  const {
    data: drawHash,
    writeContract: drawFinalNumber,
    isPending: isDrawing,
  } = useWriteContract();

  const {
    data: setKeyHashHash,
    writeContract: setKeyHashContract,
    isPending: isSettingKeyHash,
  } = useWriteContract();

  const {
    data: setAddressesHash,
    writeContract: setAddresses,
    isPending: isSettingAddresses,
  } = useWriteContract();

  const { isLoading: isStartLoading } = useWaitForTransactionReceipt({
    hash: startHash,
  });
  const { isLoading: isCloseLoading } = useWaitForTransactionReceipt({
    hash: closeHash,
  });
  const { isLoading: isDrawLoading } = useWaitForTransactionReceipt({
    hash: drawHash,
  });
  const { isLoading: isKeyHashLoading } = useWaitForTransactionReceipt({
    hash: setKeyHashHash,
  });
  const { isLoading: isAddressesLoading } = useWaitForTransactionReceipt({
    hash: setAddressesHash,
  });

  const isProcessing =
    isStarting ||
    isClosing ||
    isDrawing ||
    isSettingKeyHash ||
    isSettingAddresses ||
    isStartLoading ||
    isCloseLoading ||
    isDrawLoading ||
    isKeyHashLoading ||
    isAddressesLoading;

  const handleStartLottery = () => {
    const now = Math.floor(Date.now() / 1000);
    const endTimeSeconds = Math.floor(
      new Date(startLotteryParams.endTime).getTime() / 1000,
    );

    if (endTimeSeconds <= now) {
      alert("End time must be in the future");
      return;
    }

    // Use the token's decimals for parsing the price
    const decimals = paymentTokenInfo?.decimals || 18;
    const priceTicketInTokenUnits = parseUnits(
      startLotteryParams.priceTicket,
      decimals,
    );
    console.log({ priceTicket: startLotteryParams.priceTicket });

    startLottery({
      address: CONTRACTS.LOTTERY.address[baseSepolia.id],
      abi: LOTTERY_ABI,
      functionName: "startLottery",
      args: [
        BigInt(endTimeSeconds),
        priceTicketInTokenUnits,
        BigInt(startLotteryParams.discountDivisor),
        startLotteryParams.rewardsBreakdown.map((r) => BigInt(r)),
        BigInt(startLotteryParams.treasuryFee),
      ],
    });
  };

  const handleCloseLottery = () => {
    if (!currentLotteryId) return;

    closeLottery({
      address: CONTRACTS.LOTTERY.address[baseSepolia.id],
      abi: LOTTERY_ABI,
      functionName: "closeLottery",
      args: [currentLotteryId],
    });
  };

  const { data: paymentTokenAddress } = useReadContract({
    address: CONTRACTS.LOTTERY.address[baseSepolia.id],
    abi: LOTTERY_ABI,
    functionName: "paymentToken",
  });

  // Get payment token info
  useEffect(() => {
    if (paymentTokenAddress) {
      const tokenInfo = getTokenByAddress(
        baseSepolia.id,
        paymentTokenAddress as string,
      );
      if (tokenInfo) {
        setPaymentTokenInfo({
          address: tokenInfo.address,
          decimals: tokenInfo.decimals,
          symbol: tokenInfo.symbol,
        });
      } else {
        // If token not in our list, use default values
        setPaymentTokenInfo({
          address: paymentTokenAddress as string,
          decimals: 18, // Default to 18 decimals
          symbol: "TOKEN", // Generic symbol
        });
      }
    }
  }, [paymentTokenAddress]);

  const handleDrawFinalNumber = () => {
    if (!currentLotteryId) return;

    drawFinalNumber({
      address: CONTRACTS.LOTTERY.address[baseSepolia.id],
      abi: LOTTERY_ABI,
      functionName: "drawFinalNumberAndMakeLotteryClaimable",
      args: [currentLotteryId, autoInjection],
    });
  };

  const handleSetKeyHash = () => {
    if (!keyHash) return;

    setKeyHashContract({
      address: CONTRACTS.RANDOM_NUMBER_GENERATOR.address[baseSepolia.id],
      abi: RANDOMNUMBER_GENERATOR_ABI,
      functionName: "setKeyHash",
      args: [keyHash as Address],
    });
  };

  const handleSetAddresses = () => {
    if (!operatorAddress || !treasuryAddress || !injectorAddress) return;

    setAddresses({
      address: CONTRACTS.LOTTERY.address[baseSepolia.id],
      abi: LOTTERY_ABI,
      functionName: "setOperatorAndTreasuryAndInjectorAddresses",
      args: [
        operatorAddress as Address,
        treasuryAddress as Address,
        injectorAddress as Address,
      ],
    });
  };

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

  const canStart =
    !lotteryInfo || lotteryInfo.status === 3 || currentLotteryId === 0n;
  const canClose = lotteryInfo && lotteryInfo.status === 1;
  const canDraw = lotteryInfo && lotteryInfo.status === 2;

  return (
    <Tabs defaultValue="lottery">
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="lottery">Lottery Management</TabsTrigger>
        <TabsTrigger value="random">Random Generator</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="lottery">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Lottery Status</CardTitle>
              <CardDescription>
                {lotteryInfo
                  ? `Round #${currentLotteryId?.toString()} - ${getStatusText(Number(lotteryInfo.status))}`
                  : "Loading lottery information..."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lotteryInfo ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-md">
                    <div className="flex items-center mb-2 space-x-2">
                      <DollarSign className="w-5 h-5 text-muted-foreground" />
                      <h3 className="text-sm font-medium">Prize Pool</h3>
                    </div>
                    <p className="text-2xl font-bold">
                      {formatUnits(
                        lotteryInfo.amountCollectedInPaymentToken,
                        paymentTokenInfo?.decimals ?? 6,
                      )}{" "}
                      {paymentTokenInfo?.symbol}
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
                      {lotteryInfo.finalNumber > 0
                        ? lotteryInfo.finalNumber.toString()
                        : "Not Drawn"}
                    </p>
                  </div>
                </div>
              ) : (
                <Skeleton className="w-full h-[100px]" />
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
                <Button
                  onClick={handleStartLottery}
                  disabled={!canStart || isProcessing}
                  className="w-full"
                >
                  {isStarting || isStartLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    "Start New Lottery"
                  )}
                </Button>

                <Button
                  onClick={handleCloseLottery}
                  disabled={!canClose || isProcessing}
                  className="w-full"
                >
                  {isClosing || isCloseLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Closing...
                    </>
                  ) : (
                    "Close Lottery"
                  )}
                </Button>

                <Button
                  onClick={handleDrawFinalNumber}
                  disabled={!canDraw || isProcessing}
                  className="w-full"
                >
                  {isDrawing || isDrawLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Drawing...
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
            </CardFooter>
          </Card>

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
                <Label htmlFor="priceTicket">Ticket Price (ETH)</Label>
                <Input
                  id="priceTicket"
                  type="number"
                  step="0.001"
                  min="0.005"
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
                      <Label htmlFor={`reward-${index}`}>
                        {index + 1} Matching
                      </Label>
                      <Input
                        id={`reward-${index}`}
                        type="number"
                        min="0"
                        max="10000"
                        value={reward}
                        onChange={(e) => {
                          const newRewards = [
                            ...startLotteryParams.rewardsBreakdown,
                          ];
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
                <p className="text-xs text-muted-foreground">
                  Total:{" "}
                  {startLotteryParams.rewardsBreakdown.reduce(
                    (a, b) => a + b,
                    0,
                  )}{" "}
                  / 10000
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="random">
        <Card>
          <CardHeader>
            <CardTitle>Random Number Generator</CardTitle>
            <CardDescription>
              Configure the random number generator for the lottery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keyHash">Key Hash</Label>
              <Input
                id="keyHash"
                placeholder="0x..."
                value={keyHash}
                onChange={(e) => setKeyHash(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The key hash for Chainlink VRF
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSetKeyHash}
              disabled={!keyHash || isProcessing}
              className="w-full"
            >
              {isSettingKeyHash || isKeyHashLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Setting Key Hash...
                </>
              ) : (
                "Set Key Hash"
              )}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Lottery Settings</CardTitle>
            <CardDescription>
              Configure addresses for the lottery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="operatorAddress">Operator Address</Label>
              <Input
                id="operatorAddress"
                placeholder="0x..."
                value={operatorAddress}
                onChange={(e) => setOperatorAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The address that can operate the lottery (start, close, draw)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="treasuryAddress">Treasury Address</Label>
              <Input
                id="treasuryAddress"
                placeholder="0x..."
                value={treasuryAddress}
                onChange={(e) => setTreasuryAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The address that receives treasury fees
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="injectorAddress">Injector Address</Label>
              <Input
                id="injectorAddress"
                placeholder="0x..."
                value={injectorAddress}
                onChange={(e) => setInjectorAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The address that can inject funds into the lottery
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSetAddresses}
              disabled={
                !operatorAddress ||
                !treasuryAddress ||
                !injectorAddress ||
                isProcessing
              }
              className="w-full"
            >
              {isSettingAddresses || isAddressesLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Setting Addresses...
                </>
              ) : (
                "Set Addresses"
              )}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

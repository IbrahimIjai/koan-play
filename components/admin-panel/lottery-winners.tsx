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
import { Search, Trophy, AlertCircle, Users } from "lucide-react";
import { LOTTERY_ABI } from "@/configs/abis";
import { CONTRACTS } from "@/configs/contracts-confg";
import { baseSepolia } from "viem/chains";
import { getTokenByAddress } from "@/configs/token-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LotteryWinnersProps {
  defaultLotteryId?: bigint;
}

export default function LotteryWinners({
  defaultLotteryId,
}: LotteryWinnersProps = {}) {
  const [lotteryId, setLotteryId] = useState<bigint | undefined>(
    defaultLotteryId
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
  const [selectedBracket, setSelectedBracket] = useState<string>("all");

  // Mock data for winners - in a real implementation, this would come from contract calls
  const [winners, setWinners] = useState<Array<{
    address: string;
    ticketId: string;
    bracket: number;
    reward: string;
    claimed: boolean;
  }>>([]);

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
        paymentTokenAddress as string
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
    
    // In a real implementation, this would fetch actual winners from the contract
    fetchWinners(newId);
  };

  // Mock function to fetch winners - would be replaced with actual contract calls
  const fetchWinners = (lotteryId: bigint) => {
    // This is mock data - in a real implementation, you would fetch this from the contract
    const mockWinners = [
      {
        address: "0x1234...5678",
        ticketId: "123456",
        bracket: 5,
        reward: "1000",
        claimed: true,
      },
      {
        address: "0x2345...6789",
        ticketId: "234567",
        bracket: 4,
        reward: "500",
        claimed: false,
      },
      {
        address: "0x3456...7890",
        ticketId: "345678",
        bracket: 3,
        reward: "200",
        claimed: true,
      },
      {
        address: "0x4567...8901",
        ticketId: "456789",
        bracket: 2,
        reward: "100",
        claimed: false,
      },
      {
        address: "0x5678...9012",
        ticketId: "567890",
        bracket: 1,
        reward: "50",
        claimed: false,
      },
      {
        address: "0x6789...0123",
        ticketId: "678901",
        bracket: 0,
        reward: "10",
        claimed: true,
      },
    ];

    setWinners(mockWinners);
  };

  // Get bracket name
  const getBracketName = (bracket: number) => {
    return `${bracket + 1} Number${bracket === 0 ? "" : "s"}`;
  };

  // Filter winners by bracket
  const filteredWinners = selectedBracket === "all"
    ? winners
    : winners.filter(winner => winner.bracket === parseInt(selectedBracket));

  // Calculate total rewards
  const totalRewards = filteredWinners.reduce(
    (sum, winner) => sum + parseFloat(winner.reward),
    0
  );

  // Calculate claimed rewards
  const claimedRewards = filteredWinners
    .filter(winner => winner.claimed)
    .reduce((sum, winner) => sum + parseFloat(winner.reward), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lottery Winners</CardTitle>
          <CardDescription>View and manage lottery winners</CardDescription>
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
                  Round #{lotteryId?.toString()} - Winners
                </h3>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span>
                    Final Number:{" "}
                    {lotteryInfo.finalNumber > 0n
                      ? lotteryInfo.finalNumber.toString()
                      : "Not Drawn"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-md">
                  <div className="flex items-center mb-2 space-x-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Total Winners</h3>
                  </div>
                  <p className="text-2xl font-bold">{filteredWinners.length}</p>
                </div>

                <div className="p-4 border rounded-md">
                  <div className="flex items-center mb-2 space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-sm font-medium">Total Rewards</h3>
                  </div>
                  <p className="text-2xl font-bold">
                    {totalRewards} {tokenInfo.symbol}
                  </p>
                </div>

                <div className="p-4 border rounded-md">
                  <div className="flex items-center mb-2 space-x-2">
                    <Trophy className="w-5 h-5 text-green-500" />
                    <h3 className="text-sm font-medium">Claimed Rewards</h3>
                  </div>
                  <p className="text-2xl font-bold">
                    {claimedRewards} {tokenInfo.symbol} (
                    {totalRewards > 0
                      ? Math.round((claimedRewards / totalRewards) * 100)
                      : 0}
                    %)
                  </p>
                </div>
              </div>

              {/* Filter by bracket */}
              <div className="flex items-center space-x-2">
                <div className="w-48">
                  <Select
                    value={selectedBracket}
                    onValueChange={setSelectedBracket}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by bracket" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Brackets</SelectItem>
                      {[0, 1, 2, 3, 4, 5].map((bracket) => (
                        <SelectItem key={bracket} value={bracket.toString()}>
                          {getBracketName(bracket)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Winners table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Bracket</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWinners.length > 0 ? (
                      filteredWinners.map((winner, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono">
                            {winner.address}
                          </TableCell>
                          <TableCell>{winner.ticketId}</TableCell>
                          <TableCell>{getBracketName(winner.bracket)}</TableCell>
                          <TableCell>
                            {winner.reward} {tokenInfo.symbol}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                winner.claimed
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {winner.claimed ? "Claimed" : "Unclaimed"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No winners found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
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

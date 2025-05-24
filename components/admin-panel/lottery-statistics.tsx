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
import { LOTTERY_ABI } from "@/configs/abis";
import { CONTRACTS } from "@/configs/contracts-confg";
import { baseSepolia } from "viem/chains";
import { getTokenByAddress } from "@/configs/token-list";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function LotteryStatistics() {
  const [tokenInfo, setTokenInfo] = useState<{
    symbol: string;
    decimals: number;
  }>({
    symbol: "TOKEN",
    decimals: 18,
  });

  const [lotteryStats, setLotteryStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get current lottery ID
  const { data: currentLotteryId } = useReadContract({
    address: CONTRACTS.LOTTERY.address[baseSepolia.id],
    abi: LOTTERY_ABI,
    functionName: "viewCurrentLotteryId",
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

  // Load lottery statistics
  useEffect(() => {
    const fetchLotteryData = async () => {
      if (!currentLotteryId) return;
      
      setIsLoading(true);
      const stats = [];
      
      // Fetch data for the last 5 lotteries or fewer if not enough history
      const startId = currentLotteryId > 5n ? currentLotteryId - 5n : 1n;
      
      for (let i = startId; i <= currentLotteryId; i++) {
        try {
          const lotteryInfo = await fetch(`/api/lottery/info?id=${i.toString()}`).then(res => res.json());
          
          if (lotteryInfo) {
            stats.push({
              id: i.toString(),
              amountCollected: Number(formatUnits(
                BigInt(lotteryInfo.amountCollectedInPaymentToken || 0),
                tokenInfo.decimals
              )),
              status: Number(lotteryInfo.status),
              winners: lotteryInfo.countWinnersPerBracket ? 
                lotteryInfo.countWinnersPerBracket.reduce((a: number, b: number) => a + Number(b), 0) : 0
            });
          }
        } catch (error) {
          console.error(`Error fetching lottery ${i}:`, error);
        }
      }
      
      setLotteryStats(stats);
      setIsLoading(false);
    };

    if (currentLotteryId && tokenInfo.symbol !== "TOKEN") {
      fetchLotteryData();
    }
  }, [currentLotteryId, tokenInfo]);

  // Mock data for the pie chart (distribution of winners by bracket)
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];
  const bracketData = [
    { name: '1 Number', value: 30 },
    { name: '2 Numbers', value: 25 },
    { name: '3 Numbers', value: 20 },
    { name: '4 Numbers', value: 15 },
    { name: '5 Numbers', value: 8 },
    { name: '6 Numbers', value: 2 },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lottery Statistics</CardTitle>
          <CardDescription>Historical data and analytics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <Skeleton className="w-full h-[400px]" />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Lotteries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {currentLotteryId?.toString() || "0"}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Volume
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {lotteryStats.reduce((sum, lottery) => sum + lottery.amountCollected, 0).toFixed(2)} {tokenInfo.symbol}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Winners
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {lotteryStats.reduce((sum, lottery) => sum + lottery.winners, 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Prize Pool History</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={lotteryStats}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="id" name="Lottery ID" />
                      <YAxis name={`Amount (${tokenInfo.symbol})`} />
                      <Tooltip 
                        formatter={(value) => [`${value} ${tokenInfo.symbol}`, 'Prize Pool']}
                        labelFormatter={(label) => `Lottery #${label}`}
                      />
                      <Bar dataKey="amountCollected" fill="#8884d8" name="Prize Pool" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Winner Distribution by Bracket</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={bracketData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {bracketData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

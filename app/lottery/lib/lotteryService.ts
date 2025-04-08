"use client";

import { toast } from "sonner";

export const prizeAllocation = [
  { name: "Matches all 6", percentage: "40%" },
  { name: "Matches first 5", percentage: "20%" },
  { name: "Burn Pool", percentage: "20%" },
  { name: "Matches first 4", percentage: "10%" },
  { name: "Matches first 3", percentage: "5%" },
  { name: "Matches first 2", percentage: "3%" },
  { name: "Matches first 1", percentage: "2%" },
];
// Types for lottery state
export type LotteryStatus = "Pending" | "Open" | "Close" | "Claimable";

export interface FinishedRound {
  id: number;
  drawn: string;
  winningNumber: number[];
  prizeAmount: string;
  cakeAmount: string;
  totalPlayers: number;
  brackets: {
    name: string;
    reward: string;
    usdValue: string;
    winningTickets: number;
    rewardEach: string;
  }[];
}

export interface LotteryInfo {
  id: number;
  status: LotteryStatus;
  startTime: Date;
  endTime: Date;
  priceTicketInUSDT: string;
  prizePotUSDT: string;
  prizePotUSD: string;
  firstTicketId: number;
  lastTicketId: number;
  treasuryFee: number;
}

export interface TicketAllocation {
  name: string;
  percentage: number;
  amount: string;
  usdValue: string;
  winningTickets?: number;
  rewardEach?: string;
}

export interface UserTickets {
  ticketIds: number[];
  ticketNumbers: number[][];
  claimed: boolean[];
}

// Mock API functions
// In a real implementation, these would interact with the contract
export class LotteryService {
  private static instance: LotteryService;

  private currentLotteryId: number = 1588;
  private userTickets: UserTickets = {
    ticketIds: [],
    ticketNumbers: [],
    claimed: [],
  };

  private constructor() {}

  public static getInstance(): LotteryService {
    if (!LotteryService.instance) {
      LotteryService.instance = new LotteryService();
    }
    return LotteryService.instance;
  }

  // Get current lottery information
  public async getCurrentLottery(): Promise<LotteryInfo> {
    // In reality, this would call the contract
    return {
      id: this.currentLotteryId,
      status: "Open",
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      endTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
      priceTicketInUSDT: "5",
      prizePotUSDT: "20391",
      prizePotUSD: "$36,636",
      firstTicketId: 120000,
      lastTicketId: 123456,
      treasuryFee: 200, // 2%
    };
  }

  // Get ticket allocations for prize brackets
  public async getTicketAllocations(): Promise<TicketAllocation[]> {
    // This would typically be calculated based on contract data
    return [
      {
        name: "Match first 1",
        percentage: 2,
        amount: "408 USDT",
        usdValue: "~$733",
      },
      {
        name: "Match first 2",
        percentage: 3,
        amount: "612 USDT",
        usdValue: "~$1,099",
      },
      {
        name: "Match first 3",
        percentage: 5,
        amount: "1,020 USDT",
        usdValue: "~$1,832",
      },
      {
        name: "Match first 4",
        percentage: 10,
        amount: "2,039 USDT",
        usdValue: "~$3,664",
      },
      {
        name: "Match first 5",
        percentage: 20,
        amount: "4,078 USDT",
        usdValue: "~$7,327",
      },
      {
        name: "Match all 6",
        percentage: 40,
        amount: "8,156 USDT",
        usdValue: "~$14,654",
      },
      {
        name: "Burn",
        percentage: 20,
        amount: "4,078 USDT",
        usdValue: "~$7,327",
      },
    ];
  }

  // Buy lottery tickets
  public async buyTickets(
    ticketCount: number,
    ticketNumbers?: number[][],
  ): Promise<boolean> {
    try {
      // Mock implementation - in reality would call the contract
      console.log(`Buying ${ticketCount} tickets`);

      // Generate random numbers if not provided
      const numbers =
        ticketNumbers ||
        Array(ticketCount)
          .fill(0)
          .map(() => {
            return Array(6)
              .fill(0)
              .map(() => Math.floor(Math.random() * 10));
          });

      // Add to user tickets (mock)
      const newTicketIds = Array(ticketCount)
        .fill(0)
        .map((_, i) => 123457 + i);
      this.userTickets.ticketIds.push(...newTicketIds);
      this.userTickets.ticketNumbers.push(...numbers);
      this.userTickets.claimed.push(...Array(ticketCount).fill(false));

      return true;
    } catch (error) {
      console.error("Error buying tickets:", error);
      return false;
    }
  }

  // Check if user has any winning tickets
  public async checkWinningTickets(): Promise<{
    hasWon: boolean;
    winAmount?: string;
  }> {
    try {
      // Mock implementation with random result
      const hasWon = Math.random() < 0.3;
      return {
        hasWon,
        winAmount: hasWon
          ? `${(Math.random() * 100).toFixed(2)} USDT`
          : undefined,
      };
    } catch (error) {
      console.error("Error checking winning tickets:", error);
      return { hasWon: false };
    }
  }

  // Claim winning tickets
  public async claimWinningTickets(): Promise<boolean> {
    try {
      // Mock implementation
      toast.success("Successfully claimed your winnings!");
      return true;
    } catch (error) {
      console.error("Error claiming tickets:", error);
      return false;
    }
  }

  // Get finished round data
  public async getFinishedRound(roundId: number): Promise<FinishedRound> {
    // Mock implementation for finished round data
    return {
      id: roundId,
      drawn: "Apr 5, 2025, 1:00 AM",
      winningNumber: [5, 6, 4, 1, 1, 3],
      prizeAmount: "~$30,858",
      cakeAmount: "17,168 USDT",
      totalPlayers: 96,
      brackets: [
        {
          name: "Match first 1",
          reward: "343 USDT",
          usdValue: "~$617",
          winningTickets: 45,
          rewardEach: "7.63 USDT each",
        },
        {
          name: "Match first 2",
          reward: "515 USDT",
          usdValue: "~$926",
          winningTickets: 3,
          rewardEach: "171.68 USDT each",
        },
        {
          name: "Match first 3",
          reward: "858 USDT",
          usdValue: "~$1,543",
          winningTickets: 1,
          rewardEach: "858.41 USDT each",
        },
        {
          name: "Match first 4",
          reward: "1,717 USDT",
          usdValue: "~$3,086",
          winningTickets: 0,
          rewardEach: "",
        },
        {
          name: "Match first 5",
          reward: "3,434 USDT",
          usdValue: "~$6,172",
          winningTickets: 0,
          rewardEach: "",
        },
        {
          name: "Match all 6",
          reward: "6,867 USDT",
          usdValue: "~$12,343",
          winningTickets: 0,
          rewardEach: "",
        },
        {
          name: "Burn",
          reward: "3,434 USDT",
          usdValue: "~$6,172",
          winningTickets: 0,
          rewardEach: "",
        },
      ],
    };
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { LOTTERY_ABI } from "@/configs/abis";
import { CONTRACTS } from "@/configs/contracts-confg";

// Create a public client to interact with the blockchain
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export async function GET(request: NextRequest) {
  try {
    // Get lottery ID from query parameters
    const searchParams = request.nextUrl.searchParams;
    const lotteryId = searchParams.get("id");

    if (!lotteryId) {
      return NextResponse.json(
        { error: "Lottery ID is required" },
        { status: 400 }
      );
    }

    // Get lottery info from the contract
    const lotteryInfo = await publicClient.readContract({
      address: CONTRACTS.LOTTERY.address[baseSepolia.id],
      abi: LOTTERY_ABI,
      functionName: "viewLottery",
      args: [BigInt(lotteryId)],
    });

    return NextResponse.json(lotteryInfo);
  } catch (error) {
    console.error("Error fetching lottery info:", error);
    return NextResponse.json(
      { error: "Failed to fetch lottery information" },
      { status: 500 }
    );
  }
}

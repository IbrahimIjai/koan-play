"use client";

import { type ReactNode, useEffect, useState } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { erc20Abi, type Address } from "viem";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ApprovalCheckerProps {
  userAddress?: Address;
  tokenAddress: Address;
  spenderAddress: Address;
  amount: bigint;
  chainId: number;
  children: ReactNode;
  tokenSymbol?: string;
  className?: string;
  disabled?: boolean;
}

export default function ApprovalChecker({
  userAddress,
  tokenAddress,
  spenderAddress,
  amount,
  chainId,
  children,
  tokenSymbol = "tokens",
  className = "",
  disabled = false,
}: ApprovalCheckerProps) {
  const [hasApproval, setHasApproval] = useState(false);

  // Check allowance
  const {
    data: allowance,
    refetch: refetchAllowance,
    isLoading: isAllowanceLoading,
  } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [userAddress || "0x0", spenderAddress],
    chainId,
    query: {
      enabled: Boolean(userAddress),
    },
  });

  // Approve transaction
  const {
    data: approveHash,
    writeContract: approve,
    isPending: isApproving,
  } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isApproveLoading } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Check if the user has enough allowance
  useEffect(() => {
    if (allowance !== undefined && amount !== undefined) {
      setHasApproval(allowance >= amount);
    }
  }, [allowance, amount]);

  // Refetch allowance after approval transaction is confirmed
  useEffect(() => {
    if (!isApproveLoading && approveHash) {
      refetchAllowance();
    }
  }, [isApproveLoading, approveHash, refetchAllowance]);

  // Handle approve action
  const handleApprove = () => {
    if (!userAddress || !tokenAddress || !spenderAddress || !amount) return;

    approve({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [spenderAddress, amount],
      chainId,
    });
  };

  const isLoading = isApproving || isApproveLoading || isAllowanceLoading;

  // If user has approval, render children
  if (hasApproval) {
    return <>{children}</>;
  }

  // Otherwise, render approve button
  return (
    <Button
      onClick={handleApprove}
      disabled={isLoading || disabled || !userAddress}
      className={className}
    >
      {isLoading ? (
        <>
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          {isAllowanceLoading ? "Loading Allowance" : "Approving"}
        </>
      ) : (
        `Approve ${tokenSymbol}`
      )}
    </Button>
  );
}

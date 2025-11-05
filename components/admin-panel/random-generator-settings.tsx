"use client";

import { useEffect } from "react";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
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
import { RefreshCw } from "lucide-react";
import { RANDOMNUMBER_GENERATOR_ABI } from "@/configs/abis";
import { CONTRACTS } from "@/configs/contracts-confg";
import { baseSepolia } from "viem/chains";
import { toast } from "sonner";
import type { Address } from "viem";

export default function RandomGeneratorSettings() {
  const [keyHash, setKeyHash] = useState("");

  // Set key hash
  const {
    data: setKeyHashHash,
    writeContract: setKeyHashContract,
    isPending: isSettingKeyHash,
    error: setKeyHashError,
  } = useWriteContract();
  const { isLoading: isKeyHashLoading, isSuccess: isKeyHashSuccess } =
    useWaitForTransactionReceipt({
      hash: setKeyHashHash,
    });

  // Handle set key hash
  const handleSetKeyHash = () => {
    if (!keyHash) {
      toast.error("Missing key hash", {
        description: "Please enter a key hash",
      });
      return;
    }

    // Validate key hash format
    if (!isValidKeyHash(keyHash)) {
      toast.error("Invalid key hash format", {
        description: "The key hash must be a valid bytes32 value",
      });
      return;
    }

    setKeyHashContract({
      address: CONTRACTS.RANDOM_NUMBER_GENERATOR.address[baseSepolia.id],
      abi: RANDOMNUMBER_GENERATOR_ABI,
      functionName: "setKeyHash",
      args: [keyHash as Address],
    });
  };

  // Transaction submitted toast
  useEffect(() => {
    if (setKeyHashHash) {
      toast.info("Transaction submitted", {
        description: "Updating key hash. Waiting for confirmation...",
      });
    }
  }, [setKeyHashHash]);

  // Success toast
  useEffect(() => {
    if (isKeyHashSuccess) {
      toast.success("Key hash updated successfully!", {
        description: "The random number generator key hash has been updated.",
      });

      // Reset form after success
      setKeyHash("");
    }
  }, [isKeyHashSuccess]);

  // Error toast
  useEffect(() => {
    if (setKeyHashError) {
      toast.error("Failed to update key hash", {
        description:
          setKeyHashError.message ||
          "An error occurred while updating the key hash",
      });
    }
  }, [setKeyHashError]);

  // Validate key hash
  const isValidKeyHash = (hash: string) => {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
  };

  return (
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
          disabled={!keyHash || isSettingKeyHash || isKeyHashLoading}
          className="w-full"
        >
          {isSettingKeyHash || isKeyHashLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              {isSettingKeyHash ? "Submitting..." : "Confirming..."}
            </>
          ) : (
            "Set Key Hash"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

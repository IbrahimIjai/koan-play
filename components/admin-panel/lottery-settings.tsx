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
import { LOTTERY_ABI } from "@/configs/abis";
import { CONTRACTS } from "@/configs/contracts-confg";
import { baseSepolia } from "viem/chains";
import { toast } from "sonner";
import type { Address } from "viem";

export default function LotterySettings() {
  const [operatorAddress, setOperatorAddress] = useState("");
  const [treasuryAddress, setTreasuryAddress] = useState("");
  const [injectorAddress, setInjectorAddress] = useState("");

  // Set addresses
  const {
    data: setAddressesHash,
    writeContract: setAddresses,
    isPending: isSettingAddresses,
    isSuccess: isSetAddressesSuccess,
    reset: resetSetAddresses,
    error: setAddressesError,
  } = useWriteContract();

  const { isLoading: isAddressesLoading, isSuccess: isAddressesSuccess } =
    useWaitForTransactionReceipt({
      hash: setAddressesHash,
    });

  // Handle set addresses
  const handleSetAddresses = () => {
    if (!operatorAddress || !treasuryAddress || !injectorAddress) {
      toast.error("Missing addresses", {
        description: "Please fill in all address fields",
      });
      return;
    }

    // Validate addresses
    if (
      !isValidAddress(operatorAddress) ||
      !isValidAddress(treasuryAddress) ||
      !isValidAddress(injectorAddress)
    ) {
      toast.error("Invalid address format", {
        description: "One or more addresses are not in the correct format",
      });
      return;
    }

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

  // Transaction submitted toast
  useEffect(() => {
    if (setAddressesHash) {
      toast.info("Transaction submitted", {
        description: "Updating lottery addresses. Waiting for confirmation...",
      });
    }
  }, [setAddressesHash]);

  // Success toast
  useEffect(() => {
    if (isAddressesSuccess) {
      toast.success("Addresses updated successfully!", {
        description:
          "The operator, treasury, and injector addresses have been updated.",
      });

      // Reset form after success
      setOperatorAddress("");
      setTreasuryAddress("");
      setInjectorAddress("");
      resetSetAddresses();
    }
  }, [isAddressesSuccess, isSetAddressesSuccess, resetSetAddresses]);

  // Error toast
  useEffect(() => {
    if (setAddressesError) {
      toast.error("Failed to update addresses", {
        description:
          setAddressesError.message ||
          "An error occurred while updating addresses",
      });
    }
  }, [setAddressesError]);

  // Validate Ethereum address
  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lottery Settings</CardTitle>
        <CardDescription>Configure addresses for the lottery</CardDescription>
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
            isSettingAddresses ||
            isAddressesLoading
          }
          className="w-full"
        >
          {isSettingAddresses || isAddressesLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              {isSettingAddresses ? "Submitting..." : "Confirming..."}
            </>
          ) : (
            "Set Addresses"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

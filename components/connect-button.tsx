"use client";

import { useAccount, useBalance, useDisconnect } from "wagmi";
import { ConnectChecker } from "./checkers/connect";
import { shortenAddress } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { useState, useEffect } from "react";
import { formatEther, formatUnits } from "viem";
import { Loader2 } from "lucide-react";
import { CONTRACTS } from "@/configs/contracts-confg";
import { baseSepolia } from "viem/chains";

export default function ConnectButton() {
  const { address, chainId } = useAccount();
  const { disconnect } = useDisconnect();

  const [isOpen, setIsOpen] = useState(false);

  // Query ETH balance
  const {
    data: ethBalance,
    isLoading: isLoadingEth,
    refetch: refetchEth,
  } = useBalance({
    address: address,
  });

  // Query USDC balance
  const {
    data: usdcBalance,
    isLoading: isLoadingUsdc,
    refetch: refetchUsdc,
  } = useBalance({
    address: address,
    token: CONTRACTS.PAYMENT_TOKEN.address[chainId ?? baseSepolia.id],
  });

  // Refresh balances when drawer opens
  useEffect(() => {
    if (isOpen && address) {
      refetchEth();
      refetchUsdc();
    }
  }, [isOpen, address, refetchEth, refetchUsdc]);

  // const { open } = useAppKit();
  return (
    <ConnectChecker>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button size="sm">
            {address ? shortenAddress(address) : "Connect"}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-xl font-bold">
              Wallet Details
            </DrawerTitle>
            <p className="text-muted-foreground text-sm mt-1">
              {address && shortenAddress(address)}
            </p>
          </DrawerHeader>

          <div className="p-4 space-y-4">
            <div className="bg-secondary rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Your Address
              </h3>
              <p className="font-mono text-sm break-all">{address}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* ETH Balance */}
              <div className="bg-secondary rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  ETH Balance
                </h3>
                {isLoadingEth ? (
                  <div className="flex items-center mt-2">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <div className="mt-1">
                    <p className="text-xl font-bold">
                      {ethBalance
                        ? Number(formatEther(ethBalance.value)).toFixed(4)
                        : "0.0000"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {ethBalance?.symbol || "ETH"}
                    </p>
                  </div>
                )}
              </div>

              {/* USDC Balance */}
              <div className="bg-secondary rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  USDC Balance
                </h3>
                {isLoadingUsdc ? (
                  <div className="flex items-center mt-2">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <div className="mt-1">
                    <p className="text-xl font-bold">
                      {usdcBalance
                        ? Number(formatUnits(usdcBalance.value, 6)).toFixed(2)
                        : "0.00"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {usdcBalance?.symbol || "USDC"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DrawerFooter>
            <Button
              onClick={() => disconnect()}
              variant="destructive"
              className="w-full my-1"
            >
              Disconnect
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </ConnectChecker>
  );
}

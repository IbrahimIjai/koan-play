// components/ChainSwitcherDrawer.tsx
"use client";

import { useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { toast } from "sonner";
import Image from "next/image";

// Chain logo mapping
const chainLogoMap: Record<number, string> = {
  [baseSepolia.id]: "/base.svg", // sepolia
  [base.id]: "/base.svg", // mainnet
};

export default function ChainSwitcherDrawer() {
  const [open, setOpen] = useState(false);
  const [switchingChainId, setSwitchingChainId] = useState<number | null>(null);
  const { isConnected, chainId } = useAccount();
  const { chains, switchChain, isPending } = useSwitchChain();

  // Supported chains or use the ones from useSwitchChain
  const supportedChains = chains.length ? chains : [base, baseSepolia];

  // Get current chain info
  const currentChain = supportedChains.find((chain) => chain.id === chainId);

  // Handle chain switching
  const handleSwitchChain = (chainId: number) => {
    setSwitchingChainId(chainId);
    switchChain(
      { chainId },
      {
        onSuccess(data) {
          toast.success("Chain Switched", {
            description: `Successfully switched to ${data?.name || "new chain"}`,
          });
          setOpen(false);
          setSwitchingChainId(null);
        },
        onError(error) {
          toast.error("Error Switching Chain", {
            description: error.message,
          });
          setSwitchingChainId(null);
        },
      },
    );
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-fit gap-2">
          {currentChain && isConnected ? (
            <>
              <div className="relative flex items-center">
                {chainLogoMap[currentChain.id] && (
                  <Image
                    src={chainLogoMap[currentChain.id]}
                    alt={currentChain.name}
                    width={18}
                    height={18}
                  />
                )}
                <div className="absolute -bottom-0.5 -right-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                </div>
              </div>
              <span className="text-xs hidden lg:inline-flex">
                {currentChain.name}
              </span>
            </>
          ) : (
            <span>Select Network</span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Switch Network</DrawerTitle>
            {isConnected && currentChain && (
              <div className="flex items-center gap-2 mt-2">
                <div className="relative">
                  {chainLogoMap[currentChain.id] && (
                    <Image
                      src={chainLogoMap[currentChain.id]}
                      alt={currentChain.name}
                      width={16}
                      height={16}
                    />
                  )}
                  <div className="absolute -bottom-1 -right-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  Current: {currentChain.name}
                </span>
              </div>
            )}
          </DrawerHeader>
          <div className="p-4 grid gap-3">
            {supportedChains.map((chain) => {
              const isCurrentChain = isConnected && chainId === chain.id;
              const isSwithingThis = switchingChainId === chain.id && isPending;

              return (
                <Button
                  key={chain.id}
                  variant={isCurrentChain ? "secondary" : "outline"}
                  disabled={isSwithingThis || isPending}
                  onClick={() => handleSwitchChain(chain.id)}
                  className="w-full justify-between flex items-center"
                >
                  <div className="flex items-center gap-2">
                    {chainLogoMap[chain.id] && (
                      <Image
                        src={chainLogoMap[chain.id]}
                        alt={chain.name}
                        width={20}
                        height={20}
                      />
                    )}
                    <span>{chain.name}</span>
                  </div>
                  {isCurrentChain && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-xs">Current</span>
                    </div>
                  )}
                  {isSwithingThis && (
                    <span className="text-xs">Switching...</span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

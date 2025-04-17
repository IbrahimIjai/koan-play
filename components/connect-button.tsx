"use client";

import { useAccount } from "wagmi";
import { ConnectChecker } from "./checkers/connect";
import { shortenAddress } from "@/lib/utils";
import { Button } from "./ui/button";
// import { useAppKit } from "@reown/appkit/react";
export default function ConnectButton() {
  const { address } = useAccount();
 
  // const { open } = useAppKit();
  return (
    <ConnectChecker>
      <Button size="sm" 
      // onClick={() => open({ view: "Account" })}
        
        >
        {address ? shortenAddress(address) : "Connect"}
      </Button>
    </ConnectChecker>
  );
}

"use client";

import React from "react";
import ConnectButton from "./connect-button";
// import { useMiniKit } from "@/hooks/useMiniKit";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import ChainSwitcherDrawer from "./chain-switch drawer";
function Header() {
  const { context } = useMiniKit();

  console.log({ context });
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <div className="flex items-center gap-1">
        <Avatar className="h-4 w-4">
          <AvatarImage
            src={context?.user.pfpUrl}
            alt={context?.user.displayName}
          />
          <AvatarFallback>
            {context?.user?.displayName
              ? context?.user?.displayName.slice(0, 1)
              : "KP"}
          </AvatarFallback>
        </Avatar>
        <p className="text-xs text-muted-foreground">
          {context?.user?.displayName}
        </p>
      </div>

      <div>
        <ChainSwitcherDrawer />
        <ConnectButton />
      </div>
    </div>
  );
}

export default Header;

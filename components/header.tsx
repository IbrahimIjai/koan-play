"use client";

import React, { useState, useEffect } from "react";
import ConnectButton from "./connect-button";
import { useMiniKit } from "@/hooks/useMiniKit";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChainSwitcherDrawer from "./chain-switch drawer";

function Header() {
  const [mounted, setMounted] = useState(false);
  const { context } = useMiniKit();

  useEffect(() => {
    setMounted(true);
  }, []);

  console.log({ context });

  // Prevent hydration mismatch - render consistent placeholder during SSR
  if (!mounted) {
    return (
      <div className="flex items-center justify-between px-3 py-2 mx-auto max-w-6xl border rounded-lg p-2 mt-6 mb-4">
        <div className="flex items-center gap-1">
          <Avatar className="h-4 w-4">
            <AvatarFallback>KP</AvatarFallback>
          </Avatar>
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>

        <div className="flex items-center gap-1">
          <ChainSwitcherDrawer />
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-3 py-2 mx-auto max-w-6xl border rounded-lg p-2 mt-6 mb-4">
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

      <div className="flex items-center gap-1">
        <ChainSwitcherDrawer />
        <ConnectButton />
      </div>
    </div>
  );
}

export default Header;

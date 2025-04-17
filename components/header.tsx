"use client";

import React from "react";
import ConnectButton from "./connect-button";
import { useMiniKit } from "@/hooks/useMiniKit";

function Header() {
  const { context } = useMiniKit();

  console.log({ context });
  return (
    <div>
      <ConnectButton />
    </div>
  );
}

export default Header;

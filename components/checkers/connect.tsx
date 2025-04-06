"use client";

import { Button, ButtonProps } from "../ui/button";
import { FC } from "react";
import { useAccount } from "wagmi";

import { useIsMounted } from "@/hooks/useIsMounted";
import { useAppKit } from "@reown/appkit/react";
const ConnectChecker: FC<ButtonProps> = ({ children, size = "xl", ...props }) => {
  const isMounted = useIsMounted();
  const { open } = useAppKit();
  const { isDisconnected, isConnecting } = useAccount();

  if (!isMounted) return <Button {...props}>Loading...</Button>;

  if (isConnecting) {
    return (
      <Button disabled {...props}>
        Connecting...
      </Button>
    );
  }

  if (isDisconnected)
    return (
      <Button
        onClick={() => open({ view: "Connect" })}
        className="w-full"
        variant="secondary"
      >
        Connect Wallet
      </Button>
    );

  return <>{children}</>;
};

export { ConnectChecker };

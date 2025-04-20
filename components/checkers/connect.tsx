"use client";

import { Button, ButtonProps } from "../ui/button";
import { FC } from "react";
import { useAccount, useConnect } from "wagmi";

import { useIsMounted } from "@/hooks/useIsMounted";
// import { useAppKit } from "@reown/appkit/react";
// import { useMiniKit } from "@/hooks/useMiniKit";
import {
  useMiniKit,
  // useAddFrame,
  // useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import { farcasterFrame as miniAppConnector } from "@farcaster/frame-wagmi-connector";
import { metaMask } from "wagmi/connectors";

const ConnectChecker: FC<ButtonProps> = ({ children, ...props }) => {
  const isMounted = useIsMounted();
  const { context } = useMiniKit();
  // const { open } = useAppKit();
  const { isDisconnected, isConnecting } = useAccount();
  const { connect } = useConnect();

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
      <>
        {context ? (
          <Button onClick={() => connect({ connector: miniAppConnector() })}>
            Connect wallet
          </Button>
        ) : (
          <Button
            onClick={() => connect({ connector: metaMask() })}
            className="shadow-2xl"
          >
            Connect Wallet
          </Button>
        )}
      </>
    );

  return <>{children}</>;
};

export { ConnectChecker };

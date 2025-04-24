"use client";

import { Button, ButtonProps } from "../ui/button";
import { FC } from "react";
import { Connector, useAccount, useConnect } from "wagmi";

import { useIsMounted } from "@/hooks/useIsMounted";
// import { useAppKit } from "@reown/appkit/react";
import { useMiniKit } from "@/hooks/useMiniKit";
import { farcasterFrame as miniAppConnector } from "@farcaster/frame-wagmi-connector";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const ConnectChecker: FC<ButtonProps> = ({ children, ...props }) => {
  const isMounted = useIsMounted();
  const { context } = useMiniKit();
  // const { open } = useAppKit();
  const { isDisconnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();

  // Handle connection attempt
  const handleConnect = (connector: Connector) => {
    connect(
      { connector },
      {
        onSuccess: () => {
          toast.success(`Connected to ${connector.name}`, {
            description: "Your wallet has been successfully connected",
          });
        },
        onError: (error) => {
          toast.error("Connection failed", {
            description: error.message || "Failed to connect to wallet",
          });
        },
      },
    );
  };

  if (!isMounted) return <Button {...props}>Loading...</Button>;

  if (isConnecting) {
    return (
      <Button disabled {...props}>
        Connecting...fuk
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
          <>
            {connectors?.length === 0 ? (
              <DropdownMenuItem disabled>No wallets available</DropdownMenuItem>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="shadow-lg" {...props}>
                    Connect Wallet
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {connectors.map((connector) => (
                    <DropdownMenuItem
                      key={connector.uid}
                      onClick={() => handleConnect(connector)}
                      className="cursor-pointer flex items-center py-2"
                    >
                      {connector.icon && (
                        <div className="mr-2 h-5 w-5 overflow-hidden">
                          {typeof connector.icon === "string" ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={connector.icon}
                              alt={`${connector.name} icon`}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            ""
                          )}
                        </div>
                      )}
                      <span>{connector.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        )}
      </>
    );

  return <>{children}</>;
};

export { ConnectChecker };

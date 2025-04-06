"use client";

import { type ReactNode } from "react";
import { base } from "wagmi/chains";
// import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { wagmiAdapter } from "@/configs/reown";
import { createAppKit } from "@reown/appkit/react";
import { MiniKitProvider } from "@/providers/mini-app-provider";
import WagmiReownProvider from "@/providers/wagmi";
import { ThemeProvider } from "@/providers/theme-provider";

export function Providers(props: {
  children: ReactNode;
  cookies: string | null;
}) {
  const projectId = "926aea17b9e7bceeaff476f56a0d1d95";

  // Set up metadata
  const metadata = {
    name: "appkit-example",
    description: "AppKit Example",
    url: "https://appkitexampleapp.com", // origin must match your domain & subdomain
    icons: ["https://avatars.githubusercontent.com/u/179229932"],
  };

  // Create the modal
  createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [base],
    defaultNetwork: base,
    metadata: metadata,
    features: {
      analytics: true, // Optional - defaults to your Cloud configuration
    },
  });

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      forcedTheme="dark"
    >
      <MiniKitProvider>
        <WagmiReownProvider cookies={props.cookies}>
          {props.children}
        </WagmiReownProvider>
      </MiniKitProvider>
    </ThemeProvider>
  );
}

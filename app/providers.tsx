"use client";

import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MiniKitProvider } from "@/providers/mini-app-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { WagmiProvider } from "wagmi";
import { config } from "@/configs/wagmi";

// Set up queryClient
const queryClient = new QueryClient();

export function Providers(props: {
  children: ReactNode;
  // cookies: string | null;
}) {
  // const projectId = "926aea17b9e7bceeaff476f56a0d1d95";

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      forcedTheme="dark"
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <MiniKitProvider>{props.children}</MiniKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}

"use client";

import { wagmiAdapter, projectId } from "@/configs/reown";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { mainnet, arbitrum } from "@reown/appkit/networks";
import React, { useMemo, type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { useProviderDependencies } from "@/hooks/useProviderDependencies";

// Set up queryClient
const queryClient = new QueryClient();

// Set up metadata
const metadata = {
  name: "appkit-example",
  description: "AppKit Example",
  url: "https://appkitexampleapp.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// Create the modal
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, arbitrum],
  defaultNetwork: mainnet,
  metadata: metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});

function WagmiReownProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies,
  );

  // Check the React context for WagmiProvider and QueryClientProvider
  const { providedWagmiConfig, providedQueryClient } =
    useProviderDependencies();

  const defaultConfig = useMemo(() => {
    // IMPORTANT: Don't create a new Wagmi configuration if one already exists
    // This prevents the user-provided WagmiConfig from being overridden
    return providedWagmiConfig || (wagmiAdapter.wagmiConfig as Config);
  }, [providedWagmiConfig]);

  // If both dependencies are missing, return a context with default parent providers
  // If only one dependency is provided, expect the user to also provide the missing one
  if (!providedWagmiConfig && !providedQueryClient) {
    return (
      <WagmiProvider config={defaultConfig} initialState={initialState}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    );
  }

  return children;
}

export default WagmiReownProvider;

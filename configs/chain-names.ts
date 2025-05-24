import { baseSepolia, base, monadTestnet } from "wagmi/chains";

// Chain ID to name mapping
export const CHAIN_NAMES: Record<number, string> = {
  [base.id]: "Base",
  [baseSepolia.id]: "Base Sepolia",
  [monadTestnet.id]: "Monad Testnet",
};

/**
 * Get chain name from chain ID
 * @param chainId The chain ID
 * @returns The chain name or "Unknown Chain" if not found
 */
export const getChainName = (chainId?: number): string => {
  if (!chainId) return "Unknown Chain";
  return CHAIN_NAMES[chainId] || `Chain ID: ${chainId}`;
};

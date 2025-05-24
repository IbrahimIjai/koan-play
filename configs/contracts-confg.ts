// import { base, baseSepolia } from "viem/chains";

// export const RANDOMNUMBER_GENERATOR = {
//   [baseSepolia.id]: "0x9A8A568891031EEF8df7A8dC8976b976ad2243D3",
//   //   [base.id]: "0x9A8A568891031EEF8df7A8dC8976b976ad2243D3",
// };

// export const KOAN_LOTTERY_CONTRACT = {
//   [baseSepolia.id]: "0x6BA6E5d63dc7B87b8D3E13627221aEE83e0165c1",
//   //   [base.id]: "0x9A8A568891031EEF8df7A8dC8976b976ad2243D3",
// };

import { base, baseSepolia } from "viem/chains";
import { Abi, erc20Abi } from "viem";
import { LOTTERY_ABI, RANDOMNUMBER_GENERATOR_ABI } from "./abis";

// Define type for type-safe contract configurations
export type ContractConfig = {
  address: Record<number, `0x${string}`>;
  abi: Abi;
  chainSupported: number[];
};

// Helper function to create contract configurations
const createContractConfig = (
  addresses: Record<number, `0x${string}`>,
  abi: Abi,
): ContractConfig => ({
  address: addresses,
  abi,
  chainSupported: Object.keys(addresses).map(Number),
});

export const CONTRACTS = {
  LOTTERY: createContractConfig(
    {
      [baseSepolia.id]: "0x5567202962A48b6273f7387e68215dc6911eD5a4",
      [base.id]: "0xba277724AeA7A8319BB80fAB87929976CcE8BB40",
    },
    LOTTERY_ABI,
  ),
  PAYMENT_TOKEN: createContractConfig(
    {
      [baseSepolia.id]: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    },
    erc20Abi,
  ),
  RANDOM_NUMBER_GENERATOR: createContractConfig(
    {
      [baseSepolia.id]: "0x41074ECC1C972Ab15bfFa2814d7cc309C7ebe3CD",
      [base.id]: "0x99Ef899f9D4B1F3B79e431Bf571d9E077D6B815F",
    },
    RANDOMNUMBER_GENERATOR_ABI,
  ),
} as const;

// Type exports for easy consumption
export type ContractName = keyof typeof CONTRACTS;
export type SupportedChain = typeof baseSepolia | typeof base;

// Helper function to get contract info
export const getContractConfig = (
  contractName: ContractName,
  chainId: number,
) => {
  const contract = CONTRACTS[contractName];
  return {
    address: contract.address[chainId],
    abi: contract.abi,
    chainId,
  };
};

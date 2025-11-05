import { base, baseSepolia, monadTestnet } from "viem/chains";
import { type Abi, erc20Abi } from "viem";
import { LOTTERY_ABI, RANDOMNUMBER_GENERATOR_ABI } from "./abis";

export type ContractConfig = {
  readonly address: Readonly<Record<number, `0x${string}`>>;
  readonly abi: Abi;
  readonly chainSupported: readonly number[];
};

export const SUPPORTED_CHAIN_IDS = [
  base.id,
  baseSepolia.id,
  monadTestnet.id,
] as const;

export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];

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
      [base.id]: "0x0000000000000000000000000000000000000000",
      [baseSepolia.id]: "0x6e2337A4D7BEAF9a9313D82A9c55B79e86e1351C",
      [monadTestnet.id]: "0x0000000000000000000000000000000000000000", // TODO: Deploy
    },
    LOTTERY_ABI,
  ),
  PAYMENT_TOKEN: createContractConfig(
    {
      [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      [baseSepolia.id]: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      [monadTestnet.id]: "0x0000000000000000000000000000000000000000", // TODO: Deploy
    },
    erc20Abi,
  ),
  RANDOM_NUMBER_GENERATOR: createContractConfig(
    {
      [base.id]: "0x0000000000000000000000000000000000000000",
      [baseSepolia.id]: "0x825DA733cCf86aED57E3A0a3799Bd0104c9cbA53",
      [monadTestnet.id]: "0x0000000000000000000000000000000000000000", // TODO: Deploy
    },
    RANDOMNUMBER_GENERATOR_ABI,
  ),
} as const;

export type ContractName = keyof typeof CONTRACTS;

export const getContractConfig = (
  contractName: ContractName,
  chainId: number,
) => {
  const contract = CONTRACTS[contractName];
  const address = contract.address[chainId];

  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      `Contract ${contractName} is not deployed on chain ${chainId}`,
    );
  }

  return {
    address,
    abi: contract.abi,
    chainId,
  } as const;
};

export const isContractDeployed = (
  contractName: ContractName,
  chainId: number,
): boolean => {
  const address = CONTRACTS[contractName].address[chainId];
  return !!address && address !== "0x0000000000000000000000000000000000000000";
};

export const getDeployedChains = (contractName: ContractName): number[] => {
  return CONTRACTS[contractName].chainSupported.filter((chainId) =>
    isContractDeployed(contractName, chainId),
  );
};

import { base, baseSepolia, monadTestnet } from "viem/chains";
import { type Abi, type Address, erc20Abi } from "viem";
import { LOTTERY_ABI, RANDOMNUMBER_GENERATOR_ABI } from "./abis";

export type ContractConfig = {
  readonly address: Readonly<Record<number, Address>>;
  readonly abi: Abi;
  readonly chainSupported: readonly number[];
};

export const SUPPORTED_CHAIN_IDS = [
  base.id,
  baseSepolia.id,
  monadTestnet.id,
] as const;

export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];

const ZERO_ADDRESS: Address = "0x0000000000000000000000000000000000000000";

const createContractConfig = (
  addresses: Record<number, Address>,
  abi: Abi,
): ContractConfig => ({
  address: addresses,
  abi,
  chainSupported: Object.keys(addresses).map(Number),
});

export const CONTRACTS = {
  LOTTERY: createContractConfig(
    {
      [base.id]: ZERO_ADDRESS, // TODO: Deploy to Base Mainnet
      [baseSepolia.id]: "0xA3D4c6C4C387A96078ACbFB2879119D23FD267C9",
      [monadTestnet.id]: ZERO_ADDRESS, // TODO: Deploy to Monad Testnet
    },
    LOTTERY_ABI,
  ),
  PAYMENT_TOKEN: createContractConfig(
    {
      [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
      [baseSepolia.id]: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC
      [monadTestnet.id]: ZERO_ADDRESS, // TODO: Set payment token
    },
    erc20Abi,
  ),
  RANDOM_NUMBER_GENERATOR: createContractConfig(
    {
      [base.id]: ZERO_ADDRESS, // TODO: Deploy to Base Mainnet
      [baseSepolia.id]: "0x825DA733cCf86aED57E3A0a3799Bd0104c9cbA53",
      [monadTestnet.id]: ZERO_ADDRESS, // TODO: Deploy to Monad Testnet
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

  if (!address || address === ZERO_ADDRESS) {
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
  return !!address && address !== ZERO_ADDRESS;
};

export const getDeployedChains = (contractName: ContractName): number[] => {
  return CONTRACTS[contractName].chainSupported.filter((chainId) =>
    isContractDeployed(contractName, chainId),
  );
};

export const getSafeContractAddress = (
  contractName: ContractName,
  chainId?: number,
): Address | undefined => {
  if (!chainId) return undefined;
  const address = CONTRACTS[contractName].address[chainId];
  return address === ZERO_ADDRESS ? undefined : address;
};

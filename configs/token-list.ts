export interface TokenInfo {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
}

export const TOKEN_LIST: TokenInfo[] = [
  {
    chainId: 84532, // Base Sepolia
    address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/Koan-Protocol/token-list/main/src/logos/base-sepolia/0x036CbD53842c5426634e7929541eC2318f3dCF7e.png",
  },
];

export function getTokenByAddress(
  chainId: number,
  address: string,
): TokenInfo | undefined {
  return TOKEN_LIST.find(
    (token) =>
      token.chainId === chainId &&
      token.address.toLowerCase() === address.toLowerCase(),
  );
}

export function getTokenBySymbol(
  chainId: number,
  symbol: string,
): TokenInfo | undefined {
  return TOKEN_LIST.find(
    (token) =>
      token.chainId === chainId &&
      token.symbol.toLowerCase() === symbol.toLowerCase(),
  );
}

export function parseTokenAmount(amount: string, decimals: number): bigint {
  // Remove any commas from the input
  const cleanAmount = amount.replace(/,/g, "");

  // Split by decimal point
  const parts = cleanAmount.split(".");

  // Handle the integer part
  let result = parts[0] === "" ? "0" : parts[0];

  // Handle the fractional part if it exists
  if (parts.length > 1) {
    let fraction = parts[1];

    // Pad with zeros or truncate to match the token's decimals
    if (fraction.length > decimals) {
      fraction = fraction.substring(0, decimals);
    } else {
      fraction = fraction.padEnd(decimals, "0");
    }

    result += fraction;
  } else {
    // No fractional part, pad with zeros
    result += "0".repeat(decimals);
  }

  // Remove leading zeros
  result = result.replace(/^0+/, "");

  // If the result is empty, it was all zeros
  if (result === "") {
    return 0n;
  }

  return BigInt(result);
}

export function formatTokenAmount(amount: bigint, decimals: number): string {
  const amountStr = amount.toString().padStart(decimals + 1, "0");
  const integerPart = amountStr.slice(0, -decimals) || "0";
  const fractionalPart = amountStr.slice(-decimals);

  // Format with commas for thousands
  const formattedInteger = Number.parseInt(integerPart).toLocaleString();

  // Trim trailing zeros from fractional part
  const trimmedFractional = fractionalPart.replace(/0+$/, "");

  if (trimmedFractional.length === 0) {
    return formattedInteger;
  }

  return `${formattedInteger}.${trimmedFractional}`;
}

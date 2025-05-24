import { http, createConfig } from "wagmi";
import { baseSepolia, base, monadTestnet } from "wagmi/chains";
import { farcasterFrame as miniAppConnector } from "@farcaster/frame-wagmi-connector";

export const config = createConfig({
  chains: [base, baseSepolia, monadTestnet],
  connectors: [miniAppConnector()],
  transports: {
    [baseSepolia.id]: http(
      "https://lb.drpc.org/ogrpc?network=base-sepolia&dkey=Asv5pVcZpEZuuMS7ScKuU2e9jnLtECER8LSvik6p2x9s",
    ),
    [base.id]: http(
      "https://lb.drpc.org/ogrpc?network=base&dkey=Asv5pVcZpEZuuMS7ScKuU2e9jnLtECER8LSvik6p2x9s",
    ),
    [monadTestnet.id]: http(
      "https://lb.drpc.org/ogrpc?network=monad-testnet&dkey=Asv5pVcZpEZuuMS7ScKuU2e9jnLtECER8LSvik6p2x9s",
    ),
  },
});

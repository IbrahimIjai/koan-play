import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { farcasterFrame as miniAppConnector } from "@farcaster/frame-wagmi-connector";

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [injected(), miniAppConnector()],
  transports: {
    [baseSepolia.id]: http(
      "https://lb.drpc.org/ogrpc?network=base-sepolia&dkey=Asv5pVcZpEZuuMS7ScKuU2e9jnLtECER8LSvik6p2x9s",
    ),
  },
});

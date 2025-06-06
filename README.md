# 🎰 Koan Play - Farcaster Prediction & Lottery

A decentralized prediction market and lottery platform built as a Farcaster mini-app, inspired by PancakeSwap but using USDC. Koan Play allows users to participate in prediction markets and lotteries directly within the Farcaster ecosystem, with all payouts in USDC.

## ✨ Features

- 🎫 **USDC Lottery System**: Buy tickets with USDC for a chance to win big in regular lottery draws
- 🔮 **Prediction Markets**: Bet USDC on the outcomes of various events and markets
- 💰 **USDC Rewards**: All winnings and rewards are paid in USDC
- 🔒 **Decentralized & Secure**: Built on blockchain with smart contracts for transparency and security
- 🌐 **Farcaster Native**: Seamless experience within the Farcaster ecosystem
- 🏆 **Provably Fair**: All results and payouts are verifiable on-chain

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- Farcaster account
- Web3 wallet (MetaMask, Coinbase Wallet, etc.) with USDC on the supported network

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/koan-play.git
   cd koan-play
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Update the `.env.local` file with your configuration:
   - Redis credentials
   - Wallet private key
   - Farcaster API keys

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## 📚 Documentation

- [Smart Contracts](./docs/contracts.md)
- [API Reference](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

1. **Fork** the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Install dependencies and set up the development environment
4. Make your changes and ensure tests pass
5. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a **Pull Request**

For more details, please read our [contributing guidelines](./CONTRIBUTING.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgements

- [PancakeSwap](https://pancakeswap.finance/) for the prediction and lottery inspiration
- [Farcaster](https://farcaster.xyz/) for the social protocol
- [Next.js](https://nextjs.org/) for the React framework
- [USDC](https://www.circle.com/en/usdc) for the stablecoin integration
- [OnchainKit](https://onchainkit.xyz/) for the development toolkit
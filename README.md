# 🎰 Farcaster Lottery & Prediction App

A decentralized lottery and prediction market platform built as a Farcaster mini-app, inspired by PancakeSwap. This application allows users to participate in lotteries and make predictions on various events directly within the Farcaster ecosystem.

## ✨ Features

- 🎫 **Lottery System**: Buy tickets and win big prizes in regular lottery draws
- 🔮 **Prediction Markets**: Bet on the outcomes of various events
- 🔒 **Decentralized & Secure**: Built on blockchain for transparency and security
- 🌐 **Farcaster Integration**: Seamless experience within the Farcaster ecosystem
- 🏆 **Fair & Transparent**: All results are verifiable on-chain

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- Farcaster account
- Ethereum wallet (MetaMask, Coinbase Wallet, etc.)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/farcaster-lottery-prediction.git
   cd farcaster-lottery-prediction
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

Contributions are welcome! Please read our [contributing guidelines](./CONTRIBUTING.md) to get started.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgements

- [PancakeSwap](https://pancakeswap.finance/) for inspiration
- [Farcaster](https://farcaster.xyz/) for the social protocol
- [Next.js](https://nextjs.org/) for the React framework
- [OnchainKit](https://onchainkit.xyz/) for the development toolkit
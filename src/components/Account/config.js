import Metamask from "./WalletIcons/metamaskWallet.png";
import WalletConnect from "./WalletIcons/wallet-connect.svg";
import CoinbaseWallet from "./WalletIcons/CoinbaseWallet.png";

export const connectors = [
  {
    title: "Coinbase Wallet",
    icon: CoinbaseWallet,
    connectorId: "walletlink",
    priority: 1,
    mobileEnabled: true,
    login: async (Moralis, connector) => await Moralis.authenticate({ connector })
  },
  {
    title: "Metamask",
    icon: Metamask,
    connectorId: "injected",
    priority: 2,
    mobileEnabled: false,
    login: async (Moralis, provider) => await Moralis.authenticate({ provider })
  },
  {
    title: "WalletConnect",
    icon: WalletConnect,
    connectorId: "walletconnect",
    priority: 3,
    mobileEnabled: true,
    login: async (Moralis) => await Moralis.authenticate({ provider: "walletconnect", mobileLinks: ["metamask"] })
  }
];

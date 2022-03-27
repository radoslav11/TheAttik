import Moralis from "moralis";
import CoinbaseWalletSDK  from "@coinbase/wallet-sdk";
import Web3 from "web3";
import env from "react-dotenv";

//@ts-ignore
class WalletLinkConnector extends Moralis?.AbstractWeb3Connector {
  // A name for the connector to reference it easy later on
  type = "WalletLink";
  account: string | null = null;
  chainId: string | null = null;
  provider: unknown = null;
  walletLink = new CoinbaseWalletSDK ({
    appName: "appName",
    appLogoUrl:
      "appLogoUrl",
    darkMode: false
  });

  /**
   * A function to connect to the provider
   * This function should return an EIP1193 provider (which is the case with most wallets)
   * It should also return the account and chainId, if possible
   */
  async activate() {

    console.log("HERE?")

    const ethereum = this.walletLink.makeWeb3Provider(
        `https://speedy-nodes-nyc.moralis.io/${env.REACT_APP_MORALIS_SPEEDY_NODES_KEY}/avalanche/testnet`,
        43113
    );

    console.log("ethereum provider: ", ethereum)

    // Store the EIP-1193 provider, account and chainId
    await ethereum.enable();
    const web3 = new Web3(ethereum);
    const accounts = await web3.eth.getAccounts();
    this.account = accounts[0];
    // this.chainId = "0xA86A"; // Should be in hex format
    this.chainId = "0x1";
    this.provider = ethereum;

    // Call the subscribeToEvents from AbstractWeb3Connector to handle events like accountsChange and chainChange
    // @ts-ignore
    this.subscribeToEvents(this.provider);

    // Return the provider, account and chainId
    return {
      provider: this.provider,
      chainId: this.chainId,
      account: this.account,
    };
  }

  // Cleanup any references to torus
  async deactivate() {
    // Call the unsubscribeToEvents from AbstractWeb3Connector to handle events like accountsChange and chainChange
    // @ts-ignore
    this.unsubscribeToEvents(this.provider);

    this.walletLink.disconnect();

    this.account = null;
    this.chainId = null;
    this.provider = null;
  }
}

export default WalletLinkConnector;
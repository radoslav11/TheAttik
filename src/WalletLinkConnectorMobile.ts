import Moralis from "moralis";
import env from 'react-dotenv';

export const WalletConnectEvent = Object.freeze({
  ACCOUNTS_CHANGED: 'accountsChanged',
  CHAIN_CHANGED: 'chainChanged',
  DISCONNECT: 'disconnect',
});

//@ts-ignore
class WalletLinkConnectorMobile extends Moralis?.AbstractWeb3Connector {
  type = 'WalletLink';
  provider: any;
    account: any;
    chainId: any;

  async activate() {
    // Cleanup old data if present to avoid using previous sessions
    try {
      await this.deactivate();
    } catch (error) {
      // Do nothing
    }

    if (!this.provider) {
      let WalletLinkProvider;
      const config = {
        url: `https://speedy-nodes-nyc.moralis.io/${env.REACT_APP_MORALIS_SPEEDY_NODES_KEY}/eth/mainnet`,
        appName: "Web3-react Demo",
        supportedChainIds: [1],
      };

      try {
        WalletLinkProvider = require('@web3-react/walletlink-connector')?.default;
      } catch (error) {
        // Do nothing. User might not need walletconnect
      }

      if (!WalletLinkProvider) {
        throw new Error(
          'Cannot enable WalletLink: dependency "@web3-react/walletlink-connector" is missing'
        );
      }

      if (typeof WalletLinkProvider === 'function') {
        this.provider = new WalletLinkProvider(config);
      } else {
        // this.provider = new window.WalletLinkProvider(config);
      }
    }

    if (!this.provider) {
      throw new Error('Could not connect with WalletConnect, error in connecting to provider');
    }

    const accounts = await this.provider.enable();
    const account = accounts[0].toLowerCase();
    const { chainId } = this.provider;

    this.account = account;
    this.chainId = chainId;

    // @ts-ignore
    this.subscribeToEvents(this.provider);

    return { provider: this.provider, account, chainId: chainId };
  }

  async deactivate() {
    // @ts-ignore
    this.unsubscribeToEvents(this.provider);

    try {
      if (window) {
        window.localStorage.removeItem('walletlink');
      }
    } catch (error) {
      // Do nothing
    }

    this.account = null;
    this.chainId = null;

    if (this.provider) {
      try {
        await this.provider.disconnect();
      } catch {
        // Do nothing
      }
    }
  }
}

export default WalletLinkConnectorMobile;
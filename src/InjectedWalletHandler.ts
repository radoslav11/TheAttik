export function activateInjectedProvider(providerName: 'MetaMask' | 'CoinBase') {

    //@ts-ignore
    if (!window.ethereum?.providers) {
        return undefined;
    }

    let provider;
    switch (providerName) {
        case 'CoinBase':
            //@ts-ignore
            provider = window.ethereum.providers.find(({ isCoinbaseWallet }) => isCoinbaseWallet);
            break;
        case 'MetaMask':
            //@ts-ignore
            provider = window.ethereum.providers.find(({ isMetaMask }) => isMetaMask);
            break;
    }

    if (provider) {
        //@ts-ignore
        ethereum.setSelectedProvider(provider);
        //@ts-ignore
        console.log(window.ethereum?.selectedProvider)
    }
}
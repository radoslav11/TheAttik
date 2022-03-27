export const getNFTHistory = (
    nftAddress: string,
    nftId: string
) => {
    let covalentRequestURL = "https://api.covalenthq.com/v1/1/tokens/" + nftAddress + "/nft_transactions/"
        + nftId + "/?quote-currency=USD&format=JSON&key=ckey_8d4394ad441f493c820363caf81";
    let nftHistory = [];
    fetch(covalentRequestURL)
        .then(response => response.json())
        .then(data => {
            let nftTransactions = data.data.items[0].nft_trasactions;
            nftTransactions.forEach((nftTransaction) => {
                if (nftTransaction.log_events[0].decoded.name === "OrdersMatched") {
                    let price = 0.0;
                    if (nftTransaction.value) {
                        let nonTrimmedPrice = parseFloat(nftTransaction) / (10 ** 18);
                        price = Math.floor(nonTrimmedPrice * 100000) / 100000;
                    }
                    nftHistory.push({
                        "timestamp": nftTransaction.block_signed_at,
                        "price": price
                    });
                }
            });
            return nftHistory;
        }).catch((e) => {
            console.log(e);
            return [];
    });
};

export const getNFTImage = (
    nftAddress: string,
    nftId: string
) => {
    let alchemyRequestURL = "https://eth-mainnet.alchemyapi.io/v2/demo/getNFTMetadata?contractAddress="
        + nftAddress + "&tokenId=" + nftId + "&tokenType=erc721";

    let fallbackNFTURL = "https://cdn3.iconfinder.com/data/icons/smileys-people-smiley-essential/48/v-44-512.png";

    fetch(alchemyRequestURL)
        .then(response => response.json())
        .then(data => {
            if (data && data.media && data.media[0].gateway) {
                return data.media[0].gateway;
            }
            return fallbackNFTURL;
        }).catch((e) => {
            console.log(e);
            return fallbackNFTURL;
    });
};

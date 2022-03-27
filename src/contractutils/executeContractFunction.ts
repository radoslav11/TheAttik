import { AUCTION_HOUSE_ABI, AUCTION_ROOM_ABI, ERC721_ABI } from "./abi";
import Web3 from "web3";
import env from 'react-dotenv';
import Moralis from "moralis/types";

export const startListeners = () => {
    const web3 = new Web3("http://localhost:3000");

    //@ts-ignore
    let auctionRoom = new web3.eth.Contract(AUCTION_ROOM_ABI);
    //@ts-ignore
    let auctionHouse = new web3.eth.Contract(AUCTION_HOUSE_ABI);

    // AuctionRoom events handling.
    auctionRoom.events.Bid(function (error, result) {
        if (error) {
            console.log("Error:", error);
            return;
        }
        console.log("Sender " + result.returnValues.sender + " has bid " + result.returnValues.amount);
    });

    auctionRoom.events.Withdraw(function (error, result) {
        if (error) {
            console.log("Error:", error);
            return;
        }
        console.log("Bidder " + result.returnValues.bidder + " has withdrawn " + result.returnValues.amount);
    });

    auctionRoom.events.End(function (error, result) {
        if (error) {
            console.log("Error:", error);
            return;
        }
        console.log("Winner " + result.returnValues.winner + " has won " + result.returnValues.amount);
    });

    // AuctionHouse events handling.
    auctionHouse.events.AuctionRoomCreated(function (error, result) {
        if (error) {
            console.log("Error:", error);
            return;
        }
        // TODO: add approve step. ( by adding ERC721 token's address to emit message).
        console.log("Auction Room #" + result.returnValues.id + " with address " + result.returnValues.roomAddress);


    });


};

export const createNewRoom = async (
    roomId: number,
    nft: string,
    nftId: number,
    floorPrice: Moralis.Units,
    startTime: number,
    endTime: number,
    Moralis: any
) => {
    const sendOptions = {
        contractAddress: `${env.CONTRACT_ADDRESS}`,
        functionName: "createNewRoom",
        abi: AUCTION_HOUSE_ABI,
        params: {
            _roomId: roomId,
            _nft: nft,
            _nftId: nftId,
            _floorPrice: floorPrice,
            _startTime: startTime,
            _endTime: endTime
        },
    };

    const receipt = await executeCall(sendOptions, Moralis);
    return receipt.events[0].args.roomAddress
}

export const approveNFTTransfer = async (
    nft: string,
    nftId: number,
    roomAddress: string,
    Moralis: any
) => {
    const sendOptions = {
        contractAddress: nft,
        functionName: "approve",
        abi: ERC721_ABI,
        params: {
            to: roomAddress,
            tokenId: nftId,
        },
    };

    await executeCall(sendOptions, Moralis);
}

export const bidFunds = async (
    bid: number,
    room: string,
    Moralis: any
) => {

    if (!checkBidValidity(Moralis, bid)) {
        console.log("Invalid bid.")
        return;
    }

    const sendOptions = {
        contractAddress: room,
        functionName: "bid",
        abi: AUCTION_ROOM_ABI,
        msgValue: Moralis.Units.ETH(bid)
    }

    await executeCall(sendOptions, Moralis);
};

export const withdrawFunds = async (
    room: string,
    Moralis: any
) => {
    const sendOptions = {
        contractAddress: room,
        functionName: "withdraw",
        abi: AUCTION_ROOM_ABI
    }

    await executeCall(sendOptions, Moralis);
};

export const getActiveRooms = async (Moralis: any) => {
    const sendOptions = {
        contractAddress: `${env.CONTRACT_ADDRESS}`,
        functionName: "getActiveRoomForSeller",
        abi: AUCTION_HOUSE_ABI
    }

    return await Moralis.executeFunction(sendOptions);
}

export const getRoomNFT = async (room: string, Moralis: any) => {
    const sendOptions = {
        contractAddress: room,
        functionName: "nft",
        abi: AUCTION_ROOM_ABI
    }

    return await Moralis.executeFunction(sendOptions);
}

export const getRoomNFTId = async (room: string, Moralis: any) => {
    const sendOptions = {
        contractAddress: room,
        functionName: "nftId",
        abi: AUCTION_ROOM_ABI
    }

    return await Moralis.executeFunction(sendOptions);
}

export const getHighestBid = async (room: string, Moralis: any) => {
    const sendOptions = {
        contractAddress: room,
        functionName: "highestBid",
        abi: AUCTION_ROOM_ABI
    }

    return await Moralis.executeFunction(sendOptions);
}

export const getFloorPrice = async (room: string, Moralis: any) => {
    const sendOptions = {
        contractAddress: room,
        functionName: "floorPrice",
        abi: AUCTION_ROOM_ABI
    }

    return await Moralis.executeFunction(sendOptions);
}

export const getEndTime = async (room: string, Moralis: any) => {
    const sendOptions = {
        contractAddress: room,
        functionName: "endTime",
        abi: AUCTION_ROOM_ABI
    }

    return await Moralis.executeFunction(sendOptions);
}

export const getWithdrawAmount = async (room: string, userAddress: string, Moralis: any) => {
    const sendOptions = {
        contractAddress: room,
        functionName: "withdrawAmount",
        abi: AUCTION_ROOM_ABI,
        params: {
            "": userAddress,
        },
    }

    return await Moralis.executeFunction(sendOptions);
}

export const getSeller = async (room: string, Moralis: any) => {
    const sendOptions = {
        contractAddress: room,
        functionName: "seller",
        abi: AUCTION_ROOM_ABI,
    }

    return await Moralis.executeFunction(sendOptions);
}

export const getStarted = async (room: string, Moralis: any) => {
    const sendOptions = {
        contractAddress: room,
        functionName: "started",
        abi: AUCTION_ROOM_ABI,
    }

    return await Moralis.executeFunction(sendOptions);
}

export const getStartTime = async (room: string, Moralis: any) => {
    const sendOptions = {
        contractAddress: room,
        functionName: "startTime",
        abi: AUCTION_ROOM_ABI,
    }

    return await Moralis.executeFunction(sendOptions);
}

const executeCall = async (
    sendOptions: any,
    Moralis: any
) => {
    const transaction = await Moralis.executeFunction(sendOptions);
    console.log(transaction.hash);

    return await transaction.wait();   
};

// export const getRoomAddress = async ()

const checkBidValidity = function (Moralis: any, bid: number) {
    let user = Moralis.User.current();
    // TODO: if user.funds < bid -> reject
    return true;
}

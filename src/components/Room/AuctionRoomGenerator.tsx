import react, { useState } from 'react';
import { Card, Form, Input, Modal, Select, DatePicker, InputNumber } from 'antd';
import { useMoralis, useWeb3Transfer } from 'react-moralis';
import { useEffect } from 'react';
import { approveNFTTransfer, createNewRoom } from '../../contractutils/executeContractFunction';
const { RangePicker } = DatePicker;

const AuctionRoomGenerator = (props: any) => {

    const [visible, setVisible] = useState(false)
    const [userNFTs, setUserNFTs] = useState([])

    const [loading, setLoading] = useState(false)

    const [roomName, setRoomName] = useState("")
    const [nftAddress, setNFTAddress] = useState("")
    const [tokenId, setTokenId] = useState(-1)
    const [floorPrice, setFloorPrice] = useState(0)
    const [startTime, setStartTime] = useState(0)
    const [endTime, setEndTime] = useState(0)

    const { isAuthenticated, account, Moralis } = useMoralis();

    const handleFloorPrice = (value) => setFloorPrice(value)
    const handleNFTChange = (index: number) => {
        setNFTAddress(userNFTs[index].token_address)
        setTokenId(parseInt(userNFTs[index].token_id))
    }

    const fetchUserNFTs = () => {

        setLoading(true)

        Moralis.Web3API.account.getNFTs({ chain: "0xa869", address: account }).then((res: any) => {
            res && res.result && res.result.length > 0 && setUserNFTs(res.result)
            setLoading(false)
        })
        .catch((err: any) => {
            setLoading(false)
            console.log("error fetching user nfts: ", err)
        })
    }

    const handleClick = () => {
        if (isAuthenticated && account) {
            userNFTs.length == 0 && fetchUserNFTs()
            setVisible(true)
        }
        else
            alert("Please authenticate with your wallet.")
    }

    const handleCalendarChange = (dates: any, dateStrings: any, info: any) => {

        const unixStartTimestamp = toUnixTimestamp(dateStrings[0])
        const unixEndTimestamp = toUnixTimestamp(dateStrings[1])

        setStartTime(unixStartTimestamp)
        setEndTime(unixEndTimestamp)
    }

    const toUnixTimestamp = (dateString: string) => Math.floor(new Date(dateString).getTime() / 1000)

    const handleSubmit = () => {

        if (startTime == 0 || endTime == 0 || tokenId == -1 || startTime > endTime) return;

        props.setLoading(true);
    
        const roomId = Math.floor(Math.random() * 10000000)

        createNewRoom(roomId, nftAddress, tokenId, Moralis.Units.ETH(floorPrice), startTime, endTime, Moralis)
        .then((roomAddress: any) => {
            console.log("res: ", roomAddress)
            
            approveNFTTransfer(nftAddress, tokenId, roomAddress, Moralis)
            .then((res: any) => { 
                console.log(res)
                props.setLoading(false);
                setVisible(false)
            })
            .catch((err: any) => { 
                console.log("err: ", err);
                props.setLoading(false);
            })
        })
        .catch((err: any) => {
            console.log("err: ", err);
            props.setLoading(false);
        })
    }

    return (
        <>
            <Card title="Create Auction Room" extra={<a href="#" onClick={handleClick}>Create</a>} style={{ width: 300 }}>
                <p>Auction Room Description</p>
            </Card>
            <Modal
                title="Create Auction Room"
                visible={visible}
                onOk={handleSubmit}
                onCancel={() => setVisible(false)}
                width={1000}
            >
                <Form
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                >
                    <Form.Item label="Floor Price">
                        <InputNumber value={floorPrice} onChange={handleFloorPrice} />
                    </Form.Item>
                    <Form.Item label="Select NFT to Auction">
                        <Select loading={loading} onChange={handleNFTChange}>
                            {
                                userNFTs.map((nft: any, index: number) => 
                                    <Select.Option
                                        key={nft.token_address + nft.token_id} 
                                        value={index}
                                        // onSelect={(nft) => handleNFTChange(nft)}
                                >
                                        {nft.name + " " + nft.symbol + " " + nft.token_id}
                                    </Select.Option>)
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item label="Select Auction Range">
                        <RangePicker onCalendarChange={handleCalendarChange} showTime />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

export default AuctionRoomGenerator
import { Alert, Button, Card, Col, Form, InputNumber, Layout, Row, Statistic } from 'antd'
import Meta from 'antd/lib/card/Meta'
import { Content } from 'antd/lib/layout/layout'
import Sider from 'antd/lib/layout/Sider'
import react from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { GiHammerDrop } from "react-icons/gi";
import { useMoralis } from 'react-moralis'
import { useParams, useSearchParams } from 'react-router-dom'
import { bidFunds, getActiveRooms, getEndTime, getFloorPrice, getHighestBid, getRoomNFT, getRoomNFTId, getSeller, getStarted, getStartTime, getWithdrawAmount, withdrawFunds } from '../../contractutils/executeContractFunction'
import Marquee from 'react-fast-marquee';
const { Countdown } = Statistic;

const AuctionRoom = (props: any) => {

    const styles = {
        tools: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            rowGap: "20px"
        },
        bidSection: {
            width: "80%"
        },
        bidButton: {
            borderColor: "mediumseagreen",
            backgroundColor: "mediumseagreen"
        },
        nftContainer: {
            width: '80%', 
            display: 'flex', 
            justifyContent: 'center', 
            backgroundColor: "rgba(0, 0, 0, 0.1)" 
        },
        withdrawButton: {
            borderColor: "orange",
            backgroundColor: "orange"
        },
        highestBid: {
            marginLeft: "5px",
            marginRight: "5px",
            fontSize: "21px",
            fontWeight: "bold",
            color: "white"
        }
    }

    const [started, setStarted] = useState(false);
    const [startTime, setStartTime] = useState(-1);
    const [imgUrl, setImgUrl] = useState("")
    const [highestBid, setHighestBid] = useState(0);
    const [endTime, setEndTime] = useState(-1);
    const [bid, setBid] = useState(0);
    const [withdrawAmount, setWithdrawAmount] = useState(0);
    const [seller, setSeller] = useState("");
    const [roomExists, setRoomExists] = useState(true);
    const [intervalId, setIntervalId] = useState(null)

    let { address } = useParams()
    const [search, setSearch] = useSearchParams();

    const { isAuthenticated, account, Moralis, isWeb3Enabled, isWeb3EnableLoading } = useMoralis();

    useEffect(() => {

        if (isWeb3Enabled && account) {

            props.setLoading(true)

            const roomNFTPromise = getRoomNFT(address, Moralis)
            const roomNFTIdPromise = getRoomNFTId(address, Moralis)

            Promise.all([roomNFTPromise, roomNFTIdPromise]).then((results) => {

                const nftPromise = Moralis.Web3API.account.getNFTs({ chain: "0xa869", address });
                const highestBidPromise = getHighestBid(address, Moralis);
                const floorPricePromise = getFloorPrice(address, Moralis);
                const endTimePromise = getEndTime(address, Moralis);
                const withdrawAmountPromise = getWithdrawAmount(address, account, Moralis)
                const sellerPromise = getSeller(address, Moralis)

                Promise.all([nftPromise, highestBidPromise, floorPricePromise, endTimePromise, withdrawAmountPromise, sellerPromise]).then((resultArray: any) => {
                    console.log("result array: ", resultArray);
                    setImgUrl(resultArray[0].result[0].token_uri);
                    setHighestBid(parseInt(resultArray[1]._hex, 16) / 10**18);

                    const deadline = parseInt(resultArray[3]._hex, 16) * 1000

                    setEndTime(deadline);

                    setWithdrawAmount(parseInt(resultArray[4]._hex, 16));

                    setSeller(resultArray[5])

                    const id = setInterval(() => updatePage(), 10000)
                    setIntervalId(id)

                    props.setLoading(false)
                })
                .catch((err: any) => {
                    console.log("error: ", err)
                    props.setLoading(false)
                })

            }).catch((err: any) => {
                console.log("ERROR: ", err)
                props.setLoading(false)
            });
        }
        return () => {
            clearInterval(intervalId)
        }
    }, [isWeb3Enabled, account])

    const updatePage = () => {
        const highestBidPromise = getHighestBid(address, Moralis);
        const withdrawAmountPromise = getWithdrawAmount(address, account, Moralis)

        Promise.all([highestBidPromise, withdrawAmountPromise]).then((resultArray: any) => {
            console.log("result array: ", resultArray);
            setHighestBid(parseInt(resultArray[0]._hex, 16) / 10**18);
            setWithdrawAmount(parseInt(resultArray[1]._hex, 16));
        })
        .catch((err: any) => {
            console.log("error: ", err)
        })
    }

    const handleBidPriceChange = (value) => {
        setBid(value)
    }

    const handleBid = () => {

        if (seller.toLowerCase() === account.toLowerCase()) {
            alert("Original owner, can't place bids.");
        }
        else if (bid + withdrawAmount / 10**18 <= highestBid) {
            alert("New bid is smaller than current highest bid");
        }
        else {
            bidFunds(bid, address, Moralis).then((res: any) => {
                console.log("rs: ", res)
            })
            .catch((err: any) => {
                console.log("err: ", err)
            })
        }
    }

    const handleWithdraw = () => {
        withdrawFunds(address, Moralis).then((res: any) => {
            console.log("res: ", res);
        })
        .catch((err: any) => {
            console.log("err: ", err)
        })
    }

    if (!account) 
        return <Alert style={{ margin: "auto" }} message="Please connect your wallet to join the auction" type="warning" showIcon />
    else 
        return (
            !account 
                ? <Alert style={{ margin: "auto" }} message="Please connect your wallet to join the auction" type="warning" showIcon />
                :
            <>
                <Row>
                    <Col span={24}> 
                        { endTime > -1 && <Countdown title="Time Left" value={endTime} style={{ float: "right" }} onFinish={() => {}} /> }
                    </Col>
                </Row>
                <Row style={{ width: "80%", display: "flex", justifyContent: "center", margin: "auto" }}>
                    <Col xs={24} xl={12}>
                        {/* @ts-ignore */}
                        <div style={styles.tools}>
                            {/* <div>Highest Bid: {highestBid} AVAX</div> */}
                            
                            <Alert
                                style={{ 
                                    width: "80%",
                                    backgroundColor: "rgba(232,65,66,1)",
                                    border: "1px solid black"
                                    
                                }}
                                showIcon={false}
                                banner
                                message={
                                    <Marquee pauseOnHover gradient={false} style={{ color: "white" }}>
                                        Highest Bid: <span style={styles.highestBid}> {highestBid} </span> AVAX
                                    </Marquee>
                                }
                            />
                            <Alert style={{ width: "80%" }} message={`Withdrawable Amount: ${withdrawAmount / 10**18} AVAX`} type="info" />
                            {/* <div>Withdrawable Amount: {withdrawAmount / 10**18} AVAX</div> */}
                            <div style={styles.nftContainer}>
                                <img width="60%" style={{ minHeight: "400px" }} src={imgUrl} />
                            </div>
                            <div style={styles.bidSection}>
                                <Form>
                                    <Form.Item label="Enter Bid">
                                        <InputNumber value={bid} onChange={handleBidPriceChange} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Form>
                                <Form.Item>
                                    <Button onClick={handleBid} style={styles.bidButton} type="primary" icon={<GiHammerDrop />} disabled={bid <= 0} block>
                                        &nbsp; Place AVAX Bid
                                    </Button>
                                </Form.Item>
                                <Form.Item>
                                    <Button onClick={handleWithdraw} style={styles.withdrawButton} type="primary" disabled={withdrawAmount <= 0} block>
                                        &nbsp; Withdraw Bid
                                    </Button>
                                </Form.Item>
                            </div>
                        </div>
                    </Col>
                </Row>
            </>
        )
}

export default AuctionRoom
import { Row, Col, Divider } from "antd"
import ActiveAuctionRoomCard from "../Room/ActiveAuctionRoomCard"
import AuctionRoomGenerator from "../Room/AuctionRoomGenerator"
import GamingRoomGenerator from "../Room/GamingRoomGenerator"

export const CreatorPage = (props) => {

    const styles = {
        column: {
            display: "flex",
            justifyContent: "center"
        }
    }

    return (
        <>
            <Divider orientation="left">Create Room</Divider>
            <Row style={{ rowGap: "20px" }}>
                <Col style={styles.column} xs={24} xl={6}><AuctionRoomGenerator setLoading={props.setLoading} /></Col>
                <Col style={styles.column} xs={24} xl={6}><GamingRoomGenerator /></Col>
            </Row>
            <Divider orientation="left">Active Rooms</Divider>
            {
                props.activeAuctionRooms.length > 0 &&
                <Row style={{ rowGap: "20px" }}>
                    {
                        props.activeAuctionRooms.map((room: any) => 
                        <Col style={styles.column} xs={24} xl={6}>
                            <ActiveAuctionRoomCard room={room} />
                        </Col>
                        )
                    }
                </Row>
            }
        </>
    )
}
import react from 'react';
import { Card } from 'antd';
import { Link } from 'react-router-dom';

const ActiveAuctionRoomCard = (props: any) => {

    return (
        <>
            <Card title={`Auction Room ${parseInt(props.room.roomId._hex, 16)}`} style={{ width: 300 }}>
                <Link to={`/${props.room._room}?roomId=${parseInt(props.room.roomId._hex, 16)}`}>To Auction Room</Link>
            </Card>
        </>
    )
}

export default ActiveAuctionRoomCard
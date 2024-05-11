import axios from 'axios';
import { useEffect, useState } from 'react';

axios.defaults.baseURL = 'http://localhost:8000';

export const FindRooms = () => {
    const [rooms, setRooms] = useState([]);

    const getRooms = async () => {
        try {
            const result = await axios.get('/rooms/getRooms')
            if (result?.data?.success) {
                setRooms(result?.data?.data)
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getRooms()
    }, [])

    return (
        <div>
            {/* <button onClick={getRooms}>查询已有房间</button> */}
            <div>
                {/* 已有{rooms?.length}间房 */}
                {rooms?.map(room => {
                    return (
                        <div>
                            <span>{room.roomName}</span>
                            <button>加入房间</button>
                        </div>
                    )
                })}
                {!rooms.length && '暂无已有房间'}
            </div>


        </div>
    )
}
import React, { createContext, useState, useEffect } from "react";
import axios from 'axios'
import { backendUrl } from "../App";

export const RoomContext = createContext()
const RoomContextProvider = ({children})=>{
        const [rooms, setRooms] = useState([])
        const [loading, setLoading] = useState(true)
        const [error, setError] = useState(null)
        const fetchRooms = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await axios.get(`${backendUrl}/api/hotel/list`)
                if (res && res.data.success) {
                    setRooms(res.data.hotels)
                } else {
                    setError('Failed to load rooms from server')
                }
            } catch (err) {
                console.log('Failed to fetch rooms from API', err)
                setError('Failed to load rooms. Please try again later.')
            } finally {
                setLoading(false)
            }
        }
        useEffect(() => {
            fetchRooms()
        }, [])

        return(
                <RoomContext.Provider value={{ rooms, loading, error, refetch: fetchRooms }}>
                        {children}
                </RoomContext.Provider>
        )
}
export default RoomContextProvider

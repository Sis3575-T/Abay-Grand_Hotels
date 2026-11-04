import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from 'axios'
import { backendUrl } from "../App";

export const RoomContext = createContext()

const STORAGE_KEY = 'abay_cached_rooms'

const RoomContextProvider = ({ children }) => {
    const [rooms, setRooms] = useState(() => {
        try {
            const cached = sessionStorage.getItem(STORAGE_KEY)
            return cached ? JSON.parse(cached) : []
        } catch {
            return []
        }
    })
    const [loading, setLoading] = useState(() => {
        try {
            const cached = sessionStorage.getItem(STORAGE_KEY)
            return !cached || JSON.parse(cached).length === 0
        } catch {
            return true
        }
    })
    const [error, setError] = useState(null)

    const fetchRooms = useCallback(async (showLoading = false) => {
        if (showLoading) setLoading(true)
        setError(null)
        try {
            const res = await axios.get(`${backendUrl}/api/hotel/list`)
            if (res && res.data.success && Array.isArray(res.data.hotels)) {
                setRooms(res.data.hotels)
                try {
                    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(res.data.hotels))
                } catch {
                    // Ignore storage quota errors
                }
            } else if (rooms.length === 0) {
                setError('Failed to load rooms from server')
            }
        } catch (err) {
            console.log('Failed to fetch rooms from API', err)
            if (rooms.length === 0) {
                setError('Failed to load rooms. Please try again later.')
            }
        } finally {
            setLoading(false)
        }
    }, [rooms.length])

    useEffect(() => {
        // Fetch silently if we already have cached rooms, or show loader if cold start
        fetchRooms(rooms.length === 0)
    }, [])

    const getRoomById = useCallback((id) => {
        if (!id || !rooms || rooms.length === 0) return null
        return rooms.find(r => String(r._id) === String(id) || String(r.id) === String(id)) || null
    }, [rooms])

    return (
        <RoomContext.Provider value={{ rooms, loading, error, refetch: fetchRooms, getRoomById }}>
            {children}
        </RoomContext.Provider>
    )
}

export default RoomContextProvider

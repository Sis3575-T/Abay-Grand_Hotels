import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from "react";
import axios from 'axios'
import { backendUrl } from "../App";

const SettingsContext = createContext()

export const useSettings = () => useContext(SettingsContext)

const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef(null)

  const fetchSettings = useCallback(async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/settings/public?t=${Date.now()}`)
      if (res.data?.success && res.data?.settings) {
        setSettings(res.data.settings)
      }
    } catch (err) {
      console.log('Failed to fetch settings, using defaults', err)
    }
  }, [])

  useEffect(() => {
    (async () => {
      setLoading(true)
      await fetchSettings()
      setLoading(false)
    })()
  }, [fetchSettings])

  useEffect(() => {
    const onFocus = () => fetchSettings()
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchSettings()
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibilityChange)

    intervalRef.current = setInterval(fetchSettings, 30000)

    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchSettings])

  return (
    <SettingsContext.Provider value={{ settings, loading, refetchSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export default SettingsProvider

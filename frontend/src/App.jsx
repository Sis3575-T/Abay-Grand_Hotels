import React from 'react'
import { Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar'
import Homepage from './pages/Homepage'
import HotelDetails from './pages/HotelDetails'
import MyReservations from './pages/MyReservations'
import Footer from './components/Footer'
import RoomContextProvider from './context/RoomContext'
export const backendUrl = 'http://localhost:4000'
const App = () => {
  return(
    <RoomContextProvider>
    <div>
      <Navbar/>
      <main className='min-h-screen'>
        <Routes>
          <Route path="/" element={<Homepage />}/>
          <Route path="/room/:id" element={<HotelDetails />}/>
          <Route path="/my-reservations" element={<MyReservations />}/>
        </Routes>
        <Footer/>
      </main>
    </div>
    </RoomContextProvider>
  )
}
export default App

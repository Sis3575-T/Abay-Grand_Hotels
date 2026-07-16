import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'

const Navbar = () => {
  const { settings } = useSettings()
  const hotelName = settings?.hotelName || 'DELUXE HOTELS'
  const nameParts = hotelName.split(' ')
  const first = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ')
  const last = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ') || hotelName
  const navigate = useNavigate()
  const scrollToSection = (id) => {
    if (window.location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }
  const navigateHome = () => {
    if (window.location.pathname !== '/') {
      navigate('/')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      <nav className='fixed top-0 left-0 w-full z-50 flex items-center justify-between p-[2rem] bg-black text-white'>
        <button onClick={navigateHome} className="bg-transparent border-none cursor-pointer">
          <div>
            <h2 className='font-bold text-2xl text-white'>{first} <span className='text-lime-400'>{last}</span></h2>
          </div>
        </button>
        <ul className='flex gap-8 items-center'>
          <li><button onClick={navigateHome} className='bg-transparent border-none font-bold text-lg text-white hover:text-lime-500 cursor-pointer'>HOME</button></li>
          <li className='font-bold text-lg cursor-pointer hover:text-lime-500 ' onClick={() => scrollToSection('rooms-section')}>ROOMS</li>
          <li><Link to="/about" className='font-bold text-lg hover:text-lime-500'>ABOUT</Link></li>
          <li><Link to="/contact" className='font-bold text-lg hover:text-lime-500'>CONTACT</Link></li>
          <li>
            <Link to="/my-reservations"
              className='font-bold text-sm px-4 py-2 rounded transition-all hover:opacity-80'
              style={{ background: '#D4AF37', color: '#000' }}>
              MY RESERVATIONS
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default Navbar

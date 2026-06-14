import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {
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
  return (
    <div>
      <nav className='flex items-center justify-between p-[2rem] bg-black text-white'>
        <Link to='/'>
          <div>
            <h2 className='font-bold text-2xl'>DELUXE <span className='text-lime-400'>HOTELS</span></h2>
          </div>
        </Link>
        <ul className='flex gap-8 items-center'>
          <li className='font-bold text-lg cursor-pointer hover:text-lime-500 ' onClick={() => scrollToSection('rooms-section')}>BOOKINGS</li>
          <li className='font-bold text-lg cursor-pointer hover:text-lime-500 ' onClick={() => scrollToSection('rooms-section')}>ROOMS</li>
          <li className='font-bold text-lg cursor-pointer hover:text-lime-500 ' onClick={() => scrollToSection('footer-contact')}>CONTACT</li>
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

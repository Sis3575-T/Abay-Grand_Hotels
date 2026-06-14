import React, { useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { useNavigate } from 'react-router-dom'
import {FaFacebook, FaInstagram, FaYoutube} from 'react-icons/fa'
const Footer = () => {
  const navigate = useNavigate()
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterMsg, setNewsletterMsg] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)

  const handleNewsletter = async (e) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    setNewsletterLoading(true)
    setNewsletterMsg('')
    try {
      const res = await axios.post(`${backendUrl}/api/newsletter/subscribe`, { email: newsletterEmail.trim() })
      if (res.data?.success) {
        setNewsletterMsg(res.data.message || 'Subscribed successfully!')
        setNewsletterEmail('')
      } else {
        setNewsletterMsg(res.data?.message || 'Subscription failed')
      }
    } catch {
      setNewsletterMsg('Error subscribing. Please try again.')
    } finally {
      setNewsletterLoading(false)
    }
  }

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
    <div id="footer-contact" className= 'flex flex-col gap-12 px-16 py-16 bg-black text-white'>
      {/* top section */}
      <div className= 'grid place-content-center '>
        <h2 className="text-4xl font-bold">Sign Up for Exclusive Offers</h2>
        <form onSubmit={handleNewsletter} className='flex items-center justify-center max-w-xl mx-auto w-full'>
          <input type="email" placeholder="Enter your email" value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)} className="flex-grow px-10 py-4 border-2 border-r-0 border-lime-500 rounded-l-full outline-none text-sm" style={{ color: '#000' }} />
          <button type="submit" disabled={newsletterLoading} className="bg-lime-400 hover:bg-lime-600 text-white font-bold py-4 px-8 rounded-r-full disabled:opacity-60">{newsletterLoading ? 'Subscribing...' : 'Join Now'}</button>
        </form>
        {newsletterMsg && <p className="text-sm text-center mt-2 text-lime-400">{newsletterMsg}</p>}
      </div>
      {/* bottom section */}
      <div className= 'flex flex-col justify-between  items-center text-center gap-6'>
        <div>
        <h2 className='text-2xl font-bold'>DELUXE HOTELS</h2>
        
        <div className= 'flex justify-center gap-4 mt-3 text-lime-500'>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook className="text-3xl cursor-pointer hover:text-lime-400"/></a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram className="text-3xl cursor-pointer hover:text-lime-400"/></a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><FaYoutube className="text-3xl cursor-pointer hover:text-lime-400"/></a>
        </div>
        </div>
        <div>
          <ul className='flex gap-6 justify-center text-base font-medium'>
            <li className="cursor-pointer hover:text-lime-400" onClick={() => scrollToSection('rooms-section')}>HOME</li>
            <li className="cursor-pointer hover:text-lime-400" onClick={() => scrollToSection('rooms-section')}>BOOKINGS</li>
            <li className="cursor-pointer hover:text-lime-400" onClick={() => scrollToSection('rooms-section')}>ROOMS</li>
            <li className="cursor-pointer hover:text-lime-400" onClick={() => scrollToSection('footer-contact')}>CONTACT</li>
          </ul>
        </div>
      </div>
      <p>&copy; {new Date().getFullYear()} Your Hotel. All rights reserved.</p>
    </div>
  )
}

export default Footer

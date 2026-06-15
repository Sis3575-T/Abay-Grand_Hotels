import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { backendUrl } from '../App'
import { MdHotel, MdPeople, MdStar, MdBusiness } from 'react-icons/md'
import { FaWifi, FaTv, FaUtensils, FaSwimmingPool, FaConciergeBell, FaCar, FaSpa, FaDumbbell } from 'react-icons/fa'
import { useSettings } from '../context/SettingsContext'
import { getIcon } from '../utils/iconMap'

const statIcons = [MdHotel, MdPeople, MdStar, MdBusiness]
const statLabels = ['Luxury Rooms', 'Happy Guests', 'Years Experience', 'Guest Rating']

const AboutUs = () => {
  const { settings } = useSettings()
  const aboutTitle = settings?.aboutTitle || 'About Deluxe Hotels'
  const aboutSubtitle = settings?.aboutSubtitle || 'Experience the pinnacle of luxury and comfort'
  const aboutContent = settings?.aboutContent || ''

  const [aboutData, setAboutData] = useState(null)
  const [aboutLoading, setAboutLoading] = useState(true)

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const r = await axios.get(`${backendUrl}/api/about/get`)
        if (r.data?.success && r.data?.about) {
          setAboutData(r.data.about)
        }
      } catch {
        // Use defaults
      } finally {
        setAboutLoading(false)
      }
    }
    fetchAbout()
  }, [])

  const amenities = aboutData?.amenities || []
  const stats = aboutData?.stats || { luxuryRooms: '50+', happyGuests: '200+', yearsExperience: '15+', guestRating: '4.8' }
  const statValues = [stats.luxuryRooms, stats.happyGuests, stats.yearsExperience, stats.guestRating]

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <div className="relative h-[400px] bg-black flex items-center justify-center">
        <div className="text-center max-w-3xl px-4">
          <h1 className="text-5xl font-bold text-white">{aboutTitle}</h1>
          <p className="text-lg mt-4" style={{ color: '#D4AF37' }}>{aboutSubtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#1E293B' }}>Our Story</h2>
            {aboutContent ? (
              <div className="text-base leading-relaxed" style={{ color: '#6B7280', whiteSpace: 'pre-wrap' }}>{aboutContent}</div>
            ) : aboutData?.history ? (
              <div className="text-base leading-relaxed" style={{ color: '#6B7280', whiteSpace: 'pre-wrap' }}>{aboutData.history}</div>
            ) : (
              <>
                <p className="text-base leading-relaxed mb-4" style={{ color: '#6B7280' }}>
                  Founded with a vision to redefine hospitality, our hotel has been providing
                  world-class accommodation and services. Our commitment to excellence
                  and attention to detail has made us a preferred choice for discerning travelers
                  from around the globe.
                </p>
                <p className="text-base leading-relaxed mb-4" style={{ color: '#6B7280' }}>
                  Nestled in the heart of the city, our hotel combines modern luxury with
                  traditional hospitality. Each of our meticulously designed rooms
                  offers a sanctuary of comfort, featuring premium amenities and breathtaking views.
                </p>
                <p className="text-base leading-relaxed" style={{ color: '#6B7280' }}>
                  Whether you are traveling for business or leisure, our dedicated team ensures
                  that every moment of your stay is nothing short of extraordinary.
                </p>
              </>
            )}
          </div>
          <div className="h-[400px] rounded-xl overflow-hidden shadow-lg" style={{ background: '#1E293B' }}>
            {settings?.aboutImage ? (
              <img src={settings.aboutImage} alt="About" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MdHotel size={120} style={{ color: '#D4AF37', opacity: 0.5 }} />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {statValues.map((val, i) => {
            const Icon = statIcons[i]
            return (
              <div key={i} className="p-8 rounded-xl text-center" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <Icon size={40} className="mx-auto mb-3" style={{ color: '#2563EB' }} />
                <p className="text-3xl font-bold" style={{ color: '#1E293B' }}>{val}</p>
                <p className="text-sm mt-1" style={{ color: '#6B7280' }}>{statLabels[i]}</p>
              </div>
            )
          })}
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#1E293B' }}>Our Amenities</h2>
          {aboutLoading ? (
            <div className="text-center py-8" style={{ color: '#94A3B8' }}>Loading amenities...</div>
          ) : amenities.length === 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: FaWifi, title: 'Free Wi-Fi', desc: 'High-speed internet throughout the hotel' },
                { icon: FaTv, title: 'Cable TV', desc: 'Premium channels and entertainment' },
                { icon: FaUtensils, title: 'Restaurant', desc: 'Fine dining with local & international cuisine' },
                { icon: FaSwimmingPool, title: 'Swimming Pool', desc: 'Outdoor heated pool with poolside service' },
                { icon: FaConciergeBell, title: 'Room Service', desc: '24/7 in-room dining and assistance' },
                { icon: FaCar, title: 'Free Parking', desc: 'Secure parking for all our guests' },
                { icon: FaSpa, title: 'Spa & Wellness', desc: 'Relaxing treatments and massage services' },
                { icon: FaDumbbell, title: 'Fitness Center', desc: 'Modern gym equipment and personal training' },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-xl transition-all hover:shadow-md"
                  style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: '#EFF6FF' }}>
                    <item.icon size={24} style={{ color: '#2563EB' }} />
                  </div>
                  <h3 className="font-semibold text-base mb-2" style={{ color: '#1E293B' }}>{item.title}</h3>
                  <p className="text-sm" style={{ color: '#6B7280' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {amenities.map((item, i) => {
                const Icon = getIcon(item.icon) || FaWifi
                return (
                  <div key={item._id || i} className="p-6 rounded-xl transition-all hover:shadow-md"
                    style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: '#EFF6FF' }}>
                      <Icon size={24} style={{ color: '#2563EB' }} />
                    </div>
                    <h3 className="font-semibold text-base mb-2" style={{ color: '#1E293B' }}>{item.title}</h3>
                    <p className="text-sm" style={{ color: '#6B7280' }}>{item.desc}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="p-12 rounded-xl text-center" style={{ background: '#1E293B' }}>
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience Luxury?</h2>
          <p className="text-base mb-8" style={{ color: '#94A3B8' }}>Book your stay today and enjoy an unforgettable experience</p>
          <Link to="/"
            className="inline-block px-8 py-3 rounded-lg text-sm font-bold text-white transition-all hover:opacity-80"
            style={{ background: '#D4AF37' }}>
            Book Your Stay
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AboutUs

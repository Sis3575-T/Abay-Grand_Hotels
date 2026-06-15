import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { FaShuttleVan, FaParking, FaCocktail, FaWater, FaUtensils, FaSwimmingPool, FaHotTub, FaConciergeBell } from 'react-icons/fa'
import { useSettings } from '../context/SettingsContext'
import { getIcon } from '../utils/iconMap'

const defaultServices = [
  { icon: 'FaShuttleVan', title: 'Pick up & Drop', desc: 'Airport pick-up and drop-off for a seamless arrival and departure.' },
  { icon: 'FaConciergeBell', title: '24/7 Reception', desc: 'Round-the-clock front desk service to assist your needs.' },
  { icon: 'FaParking', title: 'Parking Space', desc: 'Secure on-site parking available for guests.' },
  { icon: 'FaCocktail', title: 'Welcome Drink', desc: 'Complimentary welcome drink on arrival.' },
  { icon: 'FaWater', title: 'Hot & Cold Water', desc: 'Hot and cold water available in rooms and facilities.' },
  { icon: 'FaUtensils', title: 'Full Board', desc: 'Dining options covering breakfast, lunch, and dinner.' },
  { icon: 'FaSwimmingPool', title: 'Swimming Pool', desc: 'Outdoor pool for relaxation and leisure.' },
  { icon: 'FaHotTub', title: 'Spa & Hot Tub', desc: 'Wellness services including a hot tub and spa treatments.' },
]

const defaultIcons = {
  FaShuttleVan, FaParking, FaCocktail, FaWater, FaUtensils, FaSwimmingPool, FaHotTub, FaConciergeBell,
}

const Facility = () => {
  const { settings } = useSettings()
  const facilityTitle = settings?.facilityTitle || 'Facilities & Services'
  const facilitySubtitle = settings?.facilitySubtitle || 'Services'

  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const r = await axios.get(`${backendUrl}/api/about/get`)
        if (r.data?.success && r.data?.about?.facilities) {
          setFacilities(r.data.about.facilities)
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false)
      }
    }
    fetchFacilities()
  }, [])

  const services = loading || facilities.length === 0 ? defaultServices : facilities

  return (
    <div className='bg-[#f8f0eb] py-16 px-4 md:px-20'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-12'>
          <p className='text-sm tracking-widest uppercase text-gray-500'>{facilitySubtitle}</p>
          <h2 className='text-4xl font-serif font-semibold text-gray-800'>{facilityTitle}</h2>
        </div>
        <div className='grid md:grid-cols-3 sm-grid-cols-2 gap-10'>
          {services.map((service, index) => {
            const Icon = getIcon(service.icon) || defaultIcons[service.icon] || FaConciergeBell
            return (
              <div key={service._id || index} className='flex flex-col items-start space-y-3'>
                <div className='bg-lime-400 rounded-full p-5 text-black'>
                  <Icon size={32} />
                </div>
                <h3 className='text-2xl font-semibold text-gray-800'>{service.title}</h3>
                <p className='text-gray-500 max-w-xs text-sm'>{service.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Facility

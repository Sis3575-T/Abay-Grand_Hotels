import React, { useContext, useState, useRef } from 'react'
import { RoomContext } from '../context/RoomContext'

import { FaBath, FaUserFriends, FaWifi, FaBed } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'

const staticAmenities = [
  { label: 'Bathtub', icon: <FaBath className='text-gray-600' /> },
  { label: 'King Size Bed', icon: <FaBed className='text-gray-600' /> },
  { label: 'Free WiFi', icon: <FaWifi className='text-gray-600' /> },
]

const HotelList = () => {
  const { rooms, loading, error } = useContext(RoomContext)
  const { settings } = useSettings()
  const roomsSectionTitle = settings?.roomsSectionTitle || 'Book your stay and relax in luxury'
  const [showAll, setShowAll] = useState(false)
  const sectionRef = useRef(null)

  const hasRooms = rooms && rooms.length > 0
  const visibleRooms = showAll ? rooms : (hasRooms ? rooms.slice(0, 4) : [])

  const handleToggle = () => {
    if (showAll) {
      setShowAll(false)
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      setShowAll(true)
    }
  }

  return (
    <div id="rooms-section" ref={sectionRef} className='bg-[#f7f0eb] py-10 md:py-16 px-4'>
      <div className='max-w-6xl mx-auto'>
        <h2 className='text-3xl md:text-4xl font-serif text-center mb-8 md:mb-12 text-gray-800'>{roomsSectionTitle}</h2>
        {loading && (
          <p className='text-gray-500 text-center col-span-full'>Loading rooms...</p>
        )}
        {error && !loading && (
          <p className='text-amber-600 text-center col-span-full mb-4'>{error}</p>
        )}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10'>
          {visibleRooms.length > 0 ? (
            visibleRooms.map((room) => {
              const { _id, image, name, price } = room
              return (
                <div key={_id} className='bg-white rounded-lg shadow overflow-hidden'>
                  <Link to={`/room/${_id}`}>
                    <img src={image} alt={name} className="w-full object-cover" />
                  </Link>
                  <div className='p-4 md:p-5 pb-2'>
                    <h3 className='text-xl md:text-2xl font-semibold text-gray-800 mb-1'>{name}</h3>
                    <p className='text-base md:text-lg font-bold text-gray-800'>${price}</p>
                  </div>
                  <div className='grid grid-cols-2 gap-3 md:gap-4 text-sm md:text-base text-gray-700 px-4 md:px-5 pb-3 md:pb-4'>
                    <div className='flex items-center gap-2'>
                      <FaUserFriends className='text-gray-600' />
                      <span>{room.occupancy || (room.capacity ? `1-${room.capacity} persons` : '1-2 persons')}</span>
                    </div>
                    {staticAmenities.map((amenity, index) => (
                      <div key={index} className='flex items-center gap-2'>
                        {amenity.icon} <span>{amenity.label} </span>
                      </div>
                    ))}
                  </div>
                  <div className='px-4 md:px-5 pb-4 md:pb-4 text-center'>
                    <Link
                      to={`/room/${_id}`}
                      className='inline-block w-3/4 md:w-1/2 bg-lime-600 text-white text-center font-semibold py-3 md:py-2.5 px-4 rounded hover:bg-lime-700 transition-colors duration-200'
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              )
            })
          ) : (
            !loading && <p className='text-gray-500 text-center col-span-full'>No rooms available.</p>
          )}
        </div>

        {!loading && hasRooms && rooms.length > 4 && (
          <div className='flex justify-center mt-8 md:mt-10'>
            <button
              onClick={handleToggle}
              className='bg-lime-600 text-white font-semibold py-3 px-8 md:px-10 rounded transition-all duration-200 hover:bg-lime-700 w-full md:w-auto'
            >
              {showAll ? 'Show Less' : 'Show More'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default HotelList

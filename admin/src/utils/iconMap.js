import {
  FaWifi, FaTv, FaUtensils, FaSwimmingPool, FaConciergeBell, FaCar, FaSpa, FaDumbbell,
  FaShuttleVan, FaParking, FaCocktail, FaWater, FaHotTub, FaCoffee, FaBicycle, FaDog,
  FaWheelchair, FaSnowflake, FaFire, FaSmokingBan, FaBath, FaBed, FaTshirt, FaClock,
} from 'react-icons/fa'

import {
  MdHotel, MdPeople, MdStar, MdBusiness, MdAcUnit, MdLocalLaundryService,
  MdRestaurant, MdRoomService, MdFitnessCenter, MdPool, MdLocalBar,
  MdDirectionsCar, MdAirportShuttle, MdChildFriendly, MdPets,
} from 'react-icons/md'

const faIconMap = {
  FaWifi, FaTv, FaUtensils, FaSwimmingPool, FaConciergeBell, FaCar, FaSpa, FaDumbbell,
  FaShuttleVan, FaParking, FaCocktail, FaWater, FaHotTub, FaCoffee, FaBicycle, FaDog,
  FaWheelchair, FaSnowflake, FaFire, FaSmokingBan, FaBath, FaBed, FaTshirt, FaClock,
}

const mdIconMap = {
  MdHotel, MdPeople, MdStar, MdBusiness, MdAcUnit, MdLocalLaundryService,
  MdRestaurant, MdRoomService, MdFitnessCenter, MdPool, MdLocalBar,
  MdDirectionsCar, MdAirportShuttle, MdChildFriendly, MdPets,
}

const allIconMap = { ...faIconMap, ...mdIconMap }

export const getIcon = (name) => allIconMap[name]

export const iconOptions = [
  { group: 'Facilities', icons: ['FaShuttleVan', 'FaParking', 'FaCocktail', 'FaWater', 'FaUtensils', 'FaSwimmingPool', 'FaHotTub', 'FaConciergeBell', 'FaCoffee', 'FaBicycle', 'FaDog', 'FaWheelchair', 'FaSnowflake', 'FaFire', 'FaSmokingBan', 'FaBath', 'FaBed', 'FaTshirt', 'FaClock'] },
  { group: 'Amenities', icons: ['FaWifi', 'FaTv', 'FaUtensils', 'FaSwimmingPool', 'FaConciergeBell', 'FaCar', 'FaSpa', 'FaDumbbell'] },
  { group: 'Material', icons: ['MdHotel', 'MdPeople', 'MdStar', 'MdBusiness', 'MdAcUnit', 'MdLocalLaundryService', 'MdRestaurant', 'MdRoomService', 'MdFitnessCenter', 'MdPool', 'MdLocalBar', 'MdDirectionsCar', 'MdAirportShuttle', 'MdChildFriendly', 'MdPets'] },
]

export default allIconMap

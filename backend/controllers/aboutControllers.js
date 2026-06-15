import About from '../models/aboutModels.js'

const defaultAbout = {
  facilities: [
    { icon: 'FaShuttleVan', title: 'Pick up & Drop', desc: 'Airport pick-up and drop-off for a seamless arrival and departure.' },
    { icon: 'FaConciergeBell', title: '24/7 Reception', desc: 'Round-the-clock front desk service to assist your needs.' },
    { icon: 'FaParking', title: 'Parking Space', desc: 'Secure on-site parking available for guests.' },
    { icon: 'FaCocktail', title: 'Welcome Drink', desc: 'Complimentary welcome drink on arrival.' },
    { icon: 'FaWater', title: 'Hot & Cold Water', desc: 'Hot and cold water available in rooms and facilities.' },
    { icon: 'FaUtensils', title: 'Full Board', desc: 'Dining options covering breakfast, lunch, and dinner.' },
    { icon: 'FaSwimmingPool', title: 'Swimming Pool', desc: 'Outdoor pool for relaxation and leisure.' },
    { icon: 'FaHotTub', title: 'Spa & Hot Tub', desc: 'Wellness services including a hot tub and spa treatments.' },
  ],
  amenities: [
    { icon: 'FaWifi', title: 'Free Wi-Fi', desc: 'High-speed internet throughout the hotel' },
    { icon: 'FaTv', title: 'Cable TV', desc: 'Premium channels and entertainment' },
    { icon: 'FaUtensils', title: 'Restaurant', desc: 'Fine dining with local & international cuisine' },
    { icon: 'FaSwimmingPool', title: 'Swimming Pool', desc: 'Outdoor heated pool with poolside service' },
    { icon: 'FaConciergeBell', title: 'Room Service', desc: '24/7 in-room dining and assistance' },
    { icon: 'FaCar', title: 'Free Parking', desc: 'Secure parking for all our guests' },
    { icon: 'FaSpa', title: 'Spa & Wellness', desc: 'Relaxing treatments and massage services' },
    { icon: 'FaDumbbell', title: 'Fitness Center', desc: 'Modern gym equipment and personal training' },
  ],
  history: '',
  stats: { luxuryRooms: '50+', happyGuests: '200+', yearsExperience: '15+', guestRating: '4.8' },
}

const getOrCreate = async () => {
  let about = await About.findOne()
  if (!about) {
    about = await About.create(defaultAbout)
  }
  return about
}

const getAbout = async (req, res) => {
  try {
    const about = await getOrCreate()
    res.json({ success: true, about })
  } catch (error) {
    console.error('getAbout error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error fetching about content' })
  }
}

const addFacility = async (req, res) => {
  try {
    const { icon, title, desc } = req.body
    if (!title || !desc) {
      return res.status(400).json({ success: false, message: 'Title and description are required' })
    }
    const about = await getOrCreate()
    about.facilities.push({ icon: icon || 'FaConciergeBell', title, desc })
    await about.save()
    res.json({ success: true, message: 'Facility added successfully', about })
  } catch (error) {
    console.error('addFacility error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error adding facility' })
  }
}

const updateFacility = async (req, res) => {
  try {
    const { id } = req.params
    const { icon, title, desc } = req.body
    const about = await getOrCreate()
    const facility = about.facilities.id(id)
    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' })
    }
    if (icon !== undefined) facility.icon = icon
    if (title !== undefined) facility.title = title
    if (desc !== undefined) facility.desc = desc
    await about.save()
    res.json({ success: true, message: 'Facility updated successfully', about })
  } catch (error) {
    console.error('updateFacility error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error updating facility' })
  }
}

const deleteFacility = async (req, res) => {
  try {
    const { id } = req.params
    const about = await getOrCreate()
    const facility = about.facilities.id(id)
    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' })
    }
    facility.deleteOne()
    await about.save()
    res.json({ success: true, message: 'Facility deleted successfully', about })
  } catch (error) {
    console.error('deleteFacility error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error deleting facility' })
  }
}

const addAmenity = async (req, res) => {
  try {
    const { icon, title, desc } = req.body
    if (!title || !desc) {
      return res.status(400).json({ success: false, message: 'Title and description are required' })
    }
    const about = await getOrCreate()
    about.amenities.push({ icon: icon || 'FaWifi', title, desc })
    await about.save()
    res.json({ success: true, message: 'Amenity added successfully', about })
  } catch (error) {
    console.error('addAmenity error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error adding amenity' })
  }
}

const updateAmenity = async (req, res) => {
  try {
    const { id } = req.params
    const { icon, title, desc } = req.body
    const about = await getOrCreate()
    const amenity = about.amenities.id(id)
    if (!amenity) {
      return res.status(404).json({ success: false, message: 'Amenity not found' })
    }
    if (icon !== undefined) amenity.icon = icon
    if (title !== undefined) amenity.title = title
    if (desc !== undefined) amenity.desc = desc
    await about.save()
    res.json({ success: true, message: 'Amenity updated successfully', about })
  } catch (error) {
    console.error('updateAmenity error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error updating amenity' })
  }
}

const deleteAmenity = async (req, res) => {
  try {
    const { id } = req.params
    const about = await getOrCreate()
    const amenity = about.amenities.id(id)
    if (!amenity) {
      return res.status(404).json({ success: false, message: 'Amenity not found' })
    }
    amenity.deleteOne()
    await about.save()
    res.json({ success: true, message: 'Amenity deleted successfully', about })
  } catch (error) {
    console.error('deleteAmenity error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error deleting amenity' })
  }
}

const updateHistory = async (req, res) => {
  try {
    const { history } = req.body
    if (history === undefined) {
      return res.status(400).json({ success: false, message: 'History text is required' })
    }
    const about = await getOrCreate()
    about.history = history
    await about.save()
    res.json({ success: true, message: 'History updated successfully', about })
  } catch (error) {
    console.error('updateHistory error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error updating history' })
  }
}

const updateStats = async (req, res) => {
  try {
    const { luxuryRooms, happyGuests, yearsExperience, guestRating } = req.body
    const about = await getOrCreate()
    if (luxuryRooms !== undefined) about.stats.luxuryRooms = luxuryRooms
    if (happyGuests !== undefined) about.stats.happyGuests = happyGuests
    if (yearsExperience !== undefined) about.stats.yearsExperience = yearsExperience
    if (guestRating !== undefined) about.stats.guestRating = guestRating
    await about.save()
    res.json({ success: true, message: 'Stats updated successfully', about })
  } catch (error) {
    console.error('updateStats error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error updating stats' })
  }
}

export { getAbout, addFacility, updateFacility, deleteFacility, addAmenity, updateAmenity, deleteAmenity, updateHistory, updateStats }

import express from 'express'
import { getAbout, addFacility, updateFacility, deleteFacility, addAmenity, updateAmenity, deleteAmenity, updateHistory, updateStats } from '../controllers/aboutControllers.js'
import adminAuth from '../middleware/adminAuth.js'

const aboutRouter = express.Router()

aboutRouter.get('/get', getAbout)
aboutRouter.post('/facility/add', adminAuth, addFacility)
aboutRouter.put('/facility/update/:id', adminAuth, updateFacility)
aboutRouter.delete('/facility/delete/:id', adminAuth, deleteFacility)
aboutRouter.post('/amenity/add', adminAuth, addAmenity)
aboutRouter.put('/amenity/update/:id', adminAuth, updateAmenity)
aboutRouter.delete('/amenity/delete/:id', adminAuth, deleteAmenity)
aboutRouter.put('/history/update', adminAuth, updateHistory)
aboutRouter.put('/stats/update', adminAuth, updateStats)

export default aboutRouter

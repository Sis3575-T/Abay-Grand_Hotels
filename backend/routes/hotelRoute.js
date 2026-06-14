import express from 'express'
import multer from 'multer'
import {addHotel, listHotel, editHotel, removeHotel, singleHotel} from '../controllers/hotelControllers.js'
import adminAuth from '../middleware/adminAuth.js'

const upload = multer({ dest: 'uploads/' })
const hotelRouter = express.Router()
hotelRouter.post('/add' , adminAuth, upload.single('image'), addHotel)
hotelRouter.post('/edit' , adminAuth, upload.single('image'), editHotel)
hotelRouter.get('/list' , listHotel)
hotelRouter.post('/remove' , adminAuth, removeHotel)
hotelRouter.get('/rooms/:id' , singleHotel)


hotelRouter.get('/test', (req, res) => res.json({ ok: true, msg: 'route test ok' }))


export default hotelRouter
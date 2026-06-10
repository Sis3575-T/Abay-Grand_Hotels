import mongoose from "mongoose";
const reservationSchema = new mongoose.Schema({
    name: {type: String, required:true},
    email: {type: String, required:true},
    phone: {type: String, required:true},
    checkin: {type: String, required:true},
    checkout: {type: String, required:true},
    guests: {type: String, required:true},
    roomName: {type: String, required:true},
    roomId: {type: String, required:true},
})
export default mongoose.model("Reservation", reservationSchema)
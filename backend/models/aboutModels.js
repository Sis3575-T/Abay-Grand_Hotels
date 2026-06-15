import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema({
  facilities: [{
    icon: { type: String, default: '' },
    title: { type: String, default: '' },
    desc: { type: String, default: '' },
  }],
  amenities: [{
    icon: { type: String, default: '' },
    title: { type: String, default: '' },
    desc: { type: String, default: '' },
  }],
  history: { type: String, default: '' },
  stats: {
    luxuryRooms: { type: String, default: '50+' },
    happyGuests: { type: String, default: '200+' },
    yearsExperience: { type: String, default: '15+' },
    guestRating: { type: String, default: '4.8' },
  },
}, { timestamps: true })

const About = mongoose.models.About || mongoose.model('About', aboutSchema)
export default About

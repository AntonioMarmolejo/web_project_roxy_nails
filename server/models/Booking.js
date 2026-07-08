import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  client: {
    name:  { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
  },
  service:   { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  date:      { type: Date, required: true },
  timeSlot:  { type: String, required: true }, // ej: "10:00"
  notes:     { type: String },
  status:    { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

export default mongoose.model('Booking', bookingSchema)

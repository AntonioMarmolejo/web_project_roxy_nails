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
  // Lugar que ocupa la cita: "AAAA-MM-DD|HH:MM|n" (n = 1..capacidad). Único, para que dos citas
  // no puedan quedarse con el mismo lugar aunque lleguen a la vez. Se quita al cancelar.
  slotKey:   { type: String, select: false },
}, { timestamps: true })

bookingSchema.index({ slotKey: 1 }, { unique: true, sparse: true })

export default mongoose.model('Booking', bookingSchema)

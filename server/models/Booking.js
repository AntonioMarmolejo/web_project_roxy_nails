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
  // Horas que ocupa la cita según la duración del servicio: "AAAA-MM-DD|HH:MM|n" por cada hora
  // (n = trabajadora 1..capacidad). Únicas entre citas, para que dos citas no se crucen aunque
  // lleguen a la vez. Se quitan al cancelar. Sin valor por defecto: un [] vacío chocaría en el índice.
  slotKeys:  { type: [String], default: undefined },
}, { timestamps: true })

bookingSchema.index({ slotKeys: 1 }, { unique: true, sparse: true })

export default mongoose.model('Booking', bookingSchema)

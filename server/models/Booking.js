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
  // 'local' = paga en el local; el resto = pago por adelantado (el comprobante llega por WhatsApp)
  paymentMethod: { type: String, enum: ['local', 'qr_deuna', 'qr_bdp', 'transfer'], default: 'local' },
  // Código de reserva (comprobante, QR y pantalla de turnos). Las citas anteriores no lo tienen:
  // para ellas el código son los últimos 6 caracteres del id.
  code:      { type: String, unique: true, sparse: true },
  // Sala de espera: cuándo llegó al local (QR escaneado) y cuándo se le llamó para atenderle
  arrivedAt: { type: Date, default: null },
  calledAt:  { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Horas que ocupa la cita según la duración del servicio: "AAAA-MM-DD|HH:MM|n" por cada hora
  // (n = trabajadora 1..capacidad). Únicas entre citas, para que dos citas no se crucen aunque
  // lleguen a la vez. Se quitan al cancelar. Sin valor por defecto: un [] vacío chocaría en el índice.
  slotKeys:  { type: [String], default: undefined },
}, { timestamps: true })

bookingSchema.index({ slotKeys: 1 }, { unique: true, sparse: true })

export default mongoose.model('Booking', bookingSchema)

import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  price:       { type: Number, required: true },
  duration:    { type: Number, required: true }, // minutos
  category:    { type: String, enum: ['manicure', 'pedicure', 'nail-art', 'extensiones', 'retiro'] },
  image:       { type: String },
  active:      { type: Boolean, default: true },
  featured:    { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.model('Service', serviceSchema)

import mongoose from 'mongoose'

const workshopSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  date:        { type: Date, required: true },
  duration:    { type: Number },        // horas
  modality:    { type: String, enum: ['presencial', 'virtual'] },
  price:       { type: Number, required: true },
  spots:       { type: Number, required: true },
  image:       { type: String },
  active:      { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Workshop', workshopSchema)

import mongoose from 'mongoose'
import { SERVICE_CATEGORIES } from './Service.js'

// Categorías anteriores: se aceptan hasta que se migren las fotos (scripts/seed-captains.js)
const LEGACY_CATEGORIES = ['manicure', 'pedicure', 'nail-art']

const galleryImageSchema = new mongoose.Schema({
  image:     { type: String, required: true },                                // URL de la foto o del video
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
  duration:  { type: Number, default: null },                                // segundos (solo videos)
  category: { type: String, enum: [...SERVICE_CATEGORIES, ...LEGACY_CATEGORIES], required: true },
  likes:    { type: Number, default: 0 },
  active:   { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('GalleryImage', galleryImageSchema)

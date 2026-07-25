import mongoose from 'mongoose'

const galleryImageSchema = new mongoose.Schema({
  image:    { type: String, required: true },
  category: { type: String, enum: ['manicure', 'pedicure', 'nail-art'], required: true },
  likes:    { type: Number, default: 0 },
  active:   { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('GalleryImage', galleryImageSchema)

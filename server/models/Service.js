import mongoose from 'mongoose'

export const SERVICE_CATEGORIES = ['capilar', 'unas', 'cejas', 'pestanas']
// Categorías del catálogo anterior: se siguen aceptando para no romper documentos existentes,
// pero ya no se ofrecen en el admin (los servicios antiguos quedan desactivados)
const LEGACY_CATEGORIES = ['manicure', 'pedicure', 'nail-art', 'extensiones', 'retiro']

const serviceSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  price:       { type: Number, default: null, min: [0, 'El precio no puede ser negativo'] },    // null = "Consultar precio"
  duration:    { type: Number, default: null, min: [0, 'La duración no puede ser negativa'] }, // minutos; null = "A consultar"
  category:    {
    type: String,
    enum: { values: [...SERVICE_CATEGORIES, ...LEGACY_CATEGORIES], message: 'Categoría no válida' },
  },
  image:       { type: String },
  active:      { type: Boolean, default: true },
  featured:    { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.model('Service', serviceSchema)

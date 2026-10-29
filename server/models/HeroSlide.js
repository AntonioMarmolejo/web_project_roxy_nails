import mongoose from 'mongoose'

// Ruta interna (/agendar) o URL https://
const LINK = /^(\/|https:\/\/)/

// Diapositiva del carrusel de la página de inicio
const heroSlideSchema = new mongoose.Schema({
  tag:       { type: String, default: '', trim: true, maxlength: [40, 'La etiqueta admite como máximo 40 caracteres'] },   // "✨ Más solicitado"
  title:     { type: String, required: [true, 'El título es obligatorio'], trim: true, maxlength: [80, 'El título admite como máximo 80 caracteres'] },
  highlight: { type: String, default: '', trim: true, maxlength: [40, 'La parte destacada admite como máximo 40 caracteres'] }, // parte del título en dorado
  subtitle:  { type: String, default: '', trim: true, maxlength: [200, 'El texto admite como máximo 200 caracteres'] },
  image:     { type: String, required: [true, 'La imagen es obligatoria'], trim: true, match: [/^https:\/\//, 'La imagen debe ser una URL que empiece por https://'] },
  primaryLabel:   { type: String, default: '', trim: true, maxlength: [30, 'El texto del botón admite como máximo 30 caracteres'] },
  primaryLink:    { type: String, default: '', trim: true, maxlength: [300, 'El enlace es demasiado largo'] },
  secondaryLabel: { type: String, default: '', trim: true, maxlength: [30, 'El texto del botón admite como máximo 30 caracteres'] },
  secondaryLink:  { type: String, default: '', trim: true, maxlength: [300, 'El enlace es demasiado largo'] },
  order:     { type: Number, default: 0 },
  active:    { type: Boolean, default: true },
}, { timestamps: true })

heroSlideSchema.pre('validate', function (next) {
  if (this.title && this.highlight && !this.title.toLowerCase().includes(this.highlight.toLowerCase())) {
    this.invalidate('highlight', 'La parte destacada debe aparecer tal cual dentro del título')
  }
  for (const b of ['primary', 'secondary']) {
    const label = this[`${b}Label`], link = this[`${b}Link`]
    const name = b === 'primary' ? 'botón principal' : 'segundo botón'
    if (label && !link) this.invalidate(`${b}Link`, `Indica a dónde lleva el ${name}`)
    if (link && !label) this.invalidate(`${b}Label`, `Escribe el texto del ${name}`)
    if (link && !LINK.test(link)) this.invalidate(`${b}Link`, 'El enlace debe ser una página del sitio (/agendar) o una URL que empiece por https://')
  }
  next()
})

export default mongoose.model('HeroSlide', heroSlideSchema)

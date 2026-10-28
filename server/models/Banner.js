import mongoose from 'mongoose'

// Banner promocional de la página de inicio. Hay un único documento (key: 'home').
const bannerSchema = new mongoose.Schema({
  key:       { type: String, default: 'home', unique: true },
  active:    { type: Boolean, default: false },
  emoji:     { type: String, default: '', maxlength: [8, 'El emoji es demasiado largo'] },
  highlight: { type: String, default: '', maxlength: [60, 'El texto destacado admite como máximo 60 caracteres'], trim: true },  // parte en negrita: "Julio: 20% OFF"
  message:   { type: String, default: '', maxlength: [160, 'El mensaje admite como máximo 160 caracteres'], trim: true }, // resto del texto
  linkText:  { type: String, default: '', maxlength: [40, 'El texto del enlace admite como máximo 40 caracteres'], trim: true },
  linkTo:    { type: String, default: '', maxlength: [300, 'El enlace es demasiado largo'], trim: true }, // ruta interna (/agendar) o URL https://
  startsAt:  { type: Date, default: null },                             // opcional: se muestra desde esta fecha
  endsAt:    { type: Date, default: null },                             // opcional: se oculta después de esta fecha
}, { timestamps: true })

// ¿Debe mostrarse ahora mismo?
bannerSchema.methods.isVisible = function (now = new Date()) {
  if (!this.active || !(this.highlight || this.message)) return false
  if (this.startsAt && now < this.startsAt) return false
  if (this.endsAt && now > this.endsAt) return false
  return true
}

export default mongoose.model('Banner', bannerSchema)

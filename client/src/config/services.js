// Categorías del catálogo (deben coincidir con SERVICE_CATEGORIES en server/models/Service.js)
export const SERVICE_CATEGORIES = [
  { key: 'capilar',  label: 'Capilar',  icon: '💇' },
  { key: 'unas',     label: 'Uñas',     icon: '💅' },
  { key: 'cejas',    label: 'Cejas',    icon: '✨' },
  { key: 'pestanas', label: 'Pestañas', icon: '👁️' },
]

const BY_KEY = Object.fromEntries(SERVICE_CATEGORIES.map(c => [c.key, c]))

export const categoryLabel = (key) => BY_KEY[key]?.label || key || ''
export const categoryIcon  = (key) => BY_KEY[key]?.icon || '✂️'

const hasValue = (v) => v !== null && v !== undefined && v !== ''

// Precio: null/vacío → "Consultar precio" (nunca "$0" ni "$null")
export const formatPrice = (price, { prefix = '' } = {}) =>
  hasValue(price) ? `${prefix}$${price}` : 'Consultar precio'

export const formatDuration = (duration) =>
  hasValue(duration) ? `${duration} min` : 'Duración a consultar'

export const hasPrice = (s) => hasValue(s?.price)

// Horario y capacidad de las citas

// Horas que se ofrecen cada día (lunes a sábado)
export const BOOKING_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00']

// Personas que atienden a la vez = citas que se aceptan en la misma hora.
// Cuando haya más trabajadoras, definir BOOKING_CAPACITY en el entorno (ej. 2) o cambiar el 1.
export const BOOKING_CAPACITY = Math.max(1, parseInt(process.env.BOOKING_CAPACITY, 10) || 1)

// Zona horaria del local, para saber qué día es "hoy"
export const BOOKING_TIMEZONE = 'Pacific/Galapagos'

// Horario y capacidad de las citas

// Horas que se ofrecen cada día (lunes a sábado). Cada una es un bloque de 1 hora;
// el hueco de 13:00 es el almuerzo y la de 18:00 termina a las 19:00 (cierre).
export const BOOKING_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00']

// Duración que se asume para un servicio sin duración cargada (minutos)
export const DEFAULT_DURATION = 60

const toMinutes = (slot) => Number(slot.slice(0, 2)) * 60 + Number(slot.slice(3))

// Horas seguidas que ocupa un servicio de `duration` minutos que empieza en `start`
// (90 min → 2 horas), o null si no termina antes del almuerzo o del cierre.
export function coveredSlots(start, duration) {
  const i = BOOKING_SLOTS.indexOf(start)
  if (i < 0) return null
  const n = Math.max(1, Math.ceil((duration || DEFAULT_DURATION) / 60))
  const run = BOOKING_SLOTS.slice(i, i + n)
  if (run.length < n) return null
  for (let k = 1; k < n; k++) if (toMinutes(run[k]) - toMinutes(run[k - 1]) !== 60) return null
  return run
}

// Personas que atienden a la vez = citas que se aceptan en la misma hora.
// Cuando haya más trabajadoras, definir BOOKING_CAPACITY en el entorno (ej. 2) o cambiar el 1.
export const BOOKING_CAPACITY = Math.max(1, parseInt(process.env.BOOKING_CAPACITY, 10) || 1)

// Zona horaria del local, para saber qué día es "hoy"
export const BOOKING_TIMEZONE = 'Pacific/Galapagos'

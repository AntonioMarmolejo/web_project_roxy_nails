// Pasa a la base de datos las 3 diapositivas que estaban fijas en el código del carrusel del inicio,
// para que la portada se vea igual y desde ahí se administren en el panel.
//
// Uso (desde server/):
//   node scripts/seed-slides.js                 → simulación: muestra lo que haría, no escribe
//   node scripts/seed-slides.js --apply         → aplica en la BD de MONGO_URI (solo localhost)
//   node scripts/seed-slides.js --apply --confirm-prod   → necesario si MONGO_URI no es localhost
//
// Es idempotente: solo inserta si todavía no hay ninguna diapositiva. Nunca modifica ni borra.

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import HeroSlide from '../models/HeroSlide.js'

dotenv.config()

const SLIDES = [
  {
    tag: '✨ Más solicitado',
    title: 'Manicure gel que dura semanas', highlight: 'gel',
    subtitle: 'Colores que no se despegan, acabados que brillan. Tu estilo, sin preocupaciones.',
    image: 'https://res.cloudinary.com/lhwns2br/image/upload/v1784258154/roxy-nails/fo64nw2o6szi9a2m2moo.jpg',
    primaryLabel: 'Ver precios', primaryLink: '/servicios',
    secondaryLabel: 'Agendar ahora', secondaryLink: '/agendar',
  },
  {
    tag: '🌸 Relajación total',
    title: 'Pedicure spa con piedras calientes', highlight: 'spa',
    subtitle: 'Un ritual completo de cuidado desde la rodilla hasta las puntas.',
    image: 'https://res.cloudinary.com/lhwns2br/image/upload/v1784258204/roxy-nails/kn1ddmkumimcfxboibof.jpg',
    primaryLabel: 'Reservar', primaryLink: '/agendar',
    secondaryLabel: 'Ver detalles', secondaryLink: '/servicios',
  },
  {
    tag: '🎓 Próximo taller',
    title: 'Aprende nail art desde cero', highlight: 'nail art',
    subtitle: 'Talleres presenciales y virtuales. Certificación incluida. ¡Plazas limitadas!',
    image: 'https://res.cloudinary.com/lhwns2br/image/upload/v1784258243/roxy-nails/im714bfargexaa9lagjp.jpg',
    primaryLabel: 'Ver talleres', primaryLink: '/talleres',
    secondaryLabel: 'Más info', secondaryLink: '/talleres',
  },
]

const args = new Set(process.argv.slice(2))
const APPLY = args.has('--apply')

async function main() {
  const uri = process.env.MONGO_URI
  if (!uri) throw new Error('Falta MONGO_URI')
  const host = uri.replace(/^mongodb(\+srv)?:\/\/([^@]*@)?/, '').split(/[/?]/)[0]
  const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)
  console.log(`Base de datos: ${host}${isLocal ? ' (local)' : ' (REMOTA)'}`)
  console.log(APPLY ? 'Modo: APLICAR cambios\n' : 'Modo: SIMULACIÓN (usa --apply para escribir)\n')
  if (APPLY && !isLocal && !args.has('--confirm-prod')) {
    throw new Error('MONGO_URI no es local. Si de verdad quieres escribir en esta base, añade --confirm-prod')
  }

  await mongoose.connect(uri)

  const existing = await HeroSlide.countDocuments()
  if (existing > 0) {
    console.log(`Ya hay ${existing} diapositiva(s). No se hace nada.`)
  } else {
    SLIDES.forEach((s, i) => console.log(`  + ${i + 1}. ${s.title}`))
    if (APPLY) {
      await HeroSlide.insertMany(SLIDES.map((s, order) => ({ ...s, order })))
      console.log(`\nInsertadas ${SLIDES.length} diapositivas.`)
    } else {
      console.log(`\nSe insertarían ${SLIDES.length} diapositivas.`)
    }
  }

  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error('\nError:', err.message)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})

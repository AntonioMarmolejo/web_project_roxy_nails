// Catálogo de Captain's Barbería Studio Unisex (Anexo A del plan de rebranding).
//
// Uso (desde server/):
//   node scripts/seed-captains.js                 → simulación: muestra lo que haría, no escribe
//   node scripts/seed-captains.js --apply         → aplica en la BD de MONGO_URI (solo localhost)
//   node scripts/seed-captains.js --apply --confirm-prod   → necesario si MONGO_URI no es localhost
//
// Es idempotente y no destructivo:
//   - Inserta los servicios que falten (por nombre + categoría). Los existentes NO se modifican,
//     así que los precios que se completen luego desde el admin se conservan.
//   - Los servicios del catálogo anterior (categorías antiguas) se marcan active: false. No se borran.
//   - Las fotos de galería con categorías antiguas pasan a la categoría 'unas'.
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Service, { SERVICE_CATEGORIES } from '../models/Service.js'
import GalleryImage from '../models/GalleryImage.js'

dotenv.config()

// price: null = "Consultar precio" (se completa luego desde el admin)
export const CATALOG = [
  { category: 'capilar',  name: 'Tratamiento con células madre',              price: null },
  { category: 'capilar',  name: 'Botox capilar',                              price: null },
  { category: 'capilar',  name: 'Alisado',                                    price: null },
  { category: 'unas',     name: 'Esmalte semipermanente – manos',             price: 25 },
  { category: 'unas',     name: 'Esmalte semipermanente – pies',              price: 25 },
  { category: 'unas',     name: 'Soft gel – diseño liso',                     price: 18 },
  { category: 'unas',     name: 'Soft gel – diseño 3D o encapsulado',         price: 25 },
  { category: 'unas',     name: 'Uñas acrílicas – medida #2',                 price: 40 },
  { category: 'unas',     name: 'Uñas acrílicas – medida #3–4',               price: 45 },
  { category: 'unas',     name: 'Recubrimiento en uña natural',               price: 35 },
  { category: 'unas',     name: 'Recubrimiento con extensión',                price: 40 },
  { category: 'unas',     name: 'Baño en acrílico',                           price: 35 },
  { category: 'cejas',    name: 'Laminado de cejas',                          price: 25 },
  { category: 'cejas',    name: 'Pigmentación en henna',                      price: 35 },
  { category: 'cejas',    name: 'Pigmentación con depilación y diseño',       price: 15 },
  { category: 'pestanas', name: 'Pestañas pelo a pelo – clásicas',            price: null },
  { category: 'pestanas', name: 'Pestañas pelo a pelo – tecnológicas',        price: null },
  { category: 'pestanas', name: 'Pestañas pelo a pelo – diseño ojo de gato',  price: null },
  { category: 'pestanas', name: 'Pestañas por punto – clásicas',              price: 20 },
  { category: 'pestanas', name: 'Pestañas por punto – con efectos',           price: 25 },
  { category: 'pestanas', name: 'Pestañas por punto – más volumen',           price: 30 },
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

  // 1) Insertar servicios que falten
  let inserted = 0
  for (const item of CATALOG) {
    const exists = await Service.exists({ name: item.name, category: item.category })
    if (exists) { console.log(`  = ya existe       ${item.category.padEnd(9)} ${item.name}`); continue }
    console.log(`  + ${APPLY ? 'insertado' : 'insertaría'}     ${item.category.padEnd(9)} ${item.name}  (${item.price === null ? 'Consultar precio' : '$' + item.price})`)
    if (APPLY) {
      await Service.updateOne(
        { name: item.name, category: item.category },
        { $setOnInsert: { ...item, duration: null, active: true, featured: false } },
        { upsert: true },
      )
    }
    inserted++
  }

  // 2) Ocultar servicios del catálogo anterior (no se borran)
  const legacyFilter = { category: { $nin: SERVICE_CATEGORIES }, active: { $ne: false } }
  const legacy = await Service.find(legacyFilter).select('name category')
  for (const s of legacy) console.log(`  - ${APPLY ? 'ocultado' : 'ocultaría'}      ${String(s.category).padEnd(9)} ${s.name}`)
  if (APPLY && legacy.length) await Service.updateMany(legacyFilter, { $set: { active: false } })

  // 3) Migrar categorías de galería antiguas a 'unas'
  const galleryFilter = { category: { $nin: SERVICE_CATEGORIES } }
  const photos = await GalleryImage.countDocuments(galleryFilter)
  if (APPLY && photos) await GalleryImage.updateMany(galleryFilter, { $set: { category: 'unas' } })

  console.log(`\nResumen: ${inserted} servicio(s) ${APPLY ? 'insertados' : 'por insertar'}, ` +
    `${legacy.length} del catálogo anterior ${APPLY ? 'ocultados' : 'por ocultar'}, ` +
    `${photos} foto(s) de galería ${APPLY ? 'migradas' : 'por migrar'} a 'unas'.`)
  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error('\nError:', err.message)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})

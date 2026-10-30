// Punto de entrada para Vercel (función serverless).
// En local se sigue usando server.js con app.listen.
import mongoose from 'mongoose'
import app from '../app.js'

// Se reutiliza la conexión entre invocaciones de la misma instancia
let connection = null

const connect = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve()
  if (!connection) {
    // Si la base no responde, fallar en 10 s (no en 30 s) para que el cliente pueda reintentar antes
    connection = mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 }).catch((err) => {
      connection = null // permite reintentar en la siguiente petición
      throw err
    })
  }
  return connection
}

export default async function handler(req, res) {
  try {
    await connect()
  } catch (err) {
    console.error('Error al conectar MongoDB:', err.message)
    return res.status(500).json({ message: 'No se pudo conectar a la base de datos' })
  }
  return app(req, res)
}

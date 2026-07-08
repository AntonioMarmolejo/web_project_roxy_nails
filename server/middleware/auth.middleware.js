import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null

  if (!token) return res.status(401).json({ message: 'No autorizado — token requerido' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id)
    next()
  } catch {
    res.status(401).json({ message: 'Token inválido o expirado' })
  }
}

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso restringido a administradores' })
  }
  next()
}

// Adjunta req.user si hay token, pero no bloquea si no hay token
export const optionalProtect = async (req, _res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null
  if (!token) return next()
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id)
  } catch {}
  next()
}

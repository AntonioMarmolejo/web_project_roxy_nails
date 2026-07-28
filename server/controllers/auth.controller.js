import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.js'
import { sendPasswordReset, mailEnabled } from '../utils/mailer.js'

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

const isStr = (v) => typeof v === 'string' && v.trim().length > 0
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body
    if (!isStr(name) || !isStr(email) || !isStr(password))
      return res.status(400).json({ message: 'Nombre, correo y contraseña son requeridos.' })
    if (!EMAIL_RE.test(email))
      return res.status(400).json({ message: 'El correo no tiene un formato válido.' })
    if (password.length < 6)
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' })

    const user = await User.create({ name, email, phone, password })
    const token = signToken(user._id)
    res.status(201).json({ token, user: { id: user._id, name, email, role: user.role } })
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Ya existe una cuenta con ese correo.' })
    next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!isStr(email) || !isStr(password)) return res.status(400).json({ message: 'Correo y contraseña requeridos' })

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Credenciales incorrectas' })

    const token = signToken(user._id)
    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } })
  } catch (err) { next(err) }
}

export const getMe = async (req, res) => {
  res.json({ user: req.user })
}

// PUT /auth/profile — editar nombre y teléfono
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body
    if (!isStr(name)) return res.status(400).json({ message: 'El nombre es requerido.' })
    if (phone !== undefined && typeof phone !== 'string')
      return res.status(400).json({ message: 'Teléfono inválido.' })

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    )
    res.json({ user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } })
  } catch (err) { next(err) }
}

// PUT /auth/change-password — cambiar contraseña estando logueado
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!isStr(currentPassword)) return res.status(400).json({ message: 'Contraseña actual requerida.' })
    if (!isStr(newPassword) || newPassword.length < 6)
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' })

    const user = await User.findById(req.user._id).select('+password')
    if (!(await user.comparePassword(currentPassword)))
      return res.status(401).json({ message: 'Contraseña actual incorrecta.' })

    user.password = newPassword
    await user.save()
    res.json({ message: 'Contraseña actualizada.' })
  } catch (err) { next(err) }
}

// POST /auth/forgot-password — solicitar enlace de recuperación
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!isStr(email)) return res.status(400).json({ message: 'Correo requerido.' })
    const user = await User.findOne({ email })

    // Misma respuesta exista o no el correo, para no filtrar qué cuentas existen
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex')
      user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex')
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000 // 1 hora
      await user.save({ validateBeforeSave: false })

      const resetUrl = `${process.env.CLIENT_URL}/restablecer-contrasena/${rawToken}`

      if (mailEnabled()) {
        sendPasswordReset({ to: user.email, name: user.name, resetUrl })
          .catch(err => console.warn('Email no enviado:', err.message))
      } else {
        console.log('🔗 Enlace de recuperación (correo no configurado aún):', resetUrl)
      }
    }

    res.json({ message: 'Si el correo existe en nuestro sistema, te enviamos un enlace de recuperación.' })
  } catch (err) { next(err) }
}

// POST /auth/reset-password/:token — establecer nueva contraseña
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params
    const { password } = req.body
    if (!isStr(password) || password.length < 6)
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' })

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) return res.status(400).json({ message: 'El enlace no es válido o ha expirado.' })

    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: 'Contraseña actualizada. Ya puedes iniciar sesión.' })
  } catch (err) { next(err) }
}

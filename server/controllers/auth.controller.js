import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body
    const user = await User.create({ name, email, phone, password })
    const token = signToken(user._id)
    res.status(201).json({ token, user: { id: user._id, name, email, role: user.role } })
  } catch (err) { next(err) }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Correo y contraseña requeridos' })

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

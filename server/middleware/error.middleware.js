export const errorHandler = (err, _req, res, _next) => {
  const status = err.status || 500
  const message = err.message || 'Error interno del servidor'

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({ message: 'Error de validación', errors })
  }

  if (err.code === 11000) {
    return res.status(400).json({ message: 'El correo ya está registrado' })
  }

  res.status(status).json({ message })
}

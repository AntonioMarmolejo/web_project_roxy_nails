import getCloudinary, { UPLOAD_FOLDER } from '../config/cloudinary.js'

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No se recibió ningún archivo' })

    const cloudinary = getCloudinary()
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: UPLOAD_FOLDER, resource_type: 'image' },
        (err, result) => err ? reject(err) : resolve(result)
      )
      stream.end(req.file.buffer)
    })

    res.status(201).json({ url: result.secure_url })
  } catch (err) { next(err) }
}

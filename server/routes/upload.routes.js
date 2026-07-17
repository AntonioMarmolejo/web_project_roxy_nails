import { Router } from 'express'
import { uploadImage } from '../controllers/upload.controller.js'
import { protect, adminOnly } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.middleware.js'

const router = Router()

router.post('/', protect, adminOnly, upload.single('image'), uploadImage)

export default router

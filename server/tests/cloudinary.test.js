import { describe, it, expect, beforeAll } from 'vitest'
import { parseCloudinaryUrl } from '../config/cloudinary.js'

beforeAll(() => { process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'nube-test' })

describe('parseCloudinaryUrl', () => {
    const cloud = () => process.env.CLOUDINARY_CLOUD_NAME

    it('reconoce imágenes y videos de nuestro Cloudinary', () => {
        expect(parseCloudinaryUrl(`https://res.cloudinary.com/${cloud()}/image/upload/v123/roxy-nails/abc.webp`))
            .toEqual({ resourceType: 'image', publicId: 'roxy-nails/abc' })
        expect(parseCloudinaryUrl(`https://res.cloudinary.com/${cloud()}/video/upload/v123/roxy-nails/clip.mp4`))
            .toEqual({ resourceType: 'video', publicId: 'roxy-nails/clip' })
    })

    it('ignora transformaciones en la URL', () => {
        expect(parseCloudinaryUrl(`https://res.cloudinary.com/${cloud()}/video/upload/so_0,w_600/v123/roxy-nails/clip.jpg`))
            .toEqual({ resourceType: 'video', publicId: 'roxy-nails/clip' })
    })

    it('rechaza URLs de otras cuentas o de otros sitios', () => {
        expect(parseCloudinaryUrl('https://res.cloudinary.com/otra-cuenta/video/upload/v1/x.mp4')).toBeNull()
        expect(parseCloudinaryUrl('https://example.com/video.mp4')).toBeNull()
        expect(parseCloudinaryUrl('')).toBeNull()
    })
})

import api from './axios'

export const uploadImage = (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
}

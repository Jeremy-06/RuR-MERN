import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as Yup from 'yup'

// Same limits as backend/utils/multer.js
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024
export const MAX_IMAGES = 10

export const isAllowedImage = (file) => IMAGE_TYPES.includes(file.type)
export const isAllowedSize = (file) => file.size <= MAX_IMAGE_SIZE

export const avatarSchema = Yup.mixed()
    .nullable()
    .test('fileType', 'Avatar must be a jpg, jpeg, png or webp image', file => !file || isAllowedImage(file))
    .test('fileSize', 'Avatar must be 5MB or smaller', file => !file || isAllowedSize(file))

export const readAsDataURL = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
})

export const categories = [
    'Keyboards',
    'Mice',
    'Headsets',
    'Monitors',
    'Controllers',
    'Chairs',
    'Desks',
    'Mousepads',
    'Microphones',
    'Webcams',
    'Lighting',
    'Accessories'
]

export const errMsg = (message = '') => toast.error(message, {
    position: 'bottom-center'
});
export const successMsg = (message = '') => toast.success(message, {
    position: 'bottom-center'
});

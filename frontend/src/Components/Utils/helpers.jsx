import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as Yup from 'yup'
import dayjs from 'dayjs'

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
    'Speakers',
    'Monitors',
    'Controllers',
    'Chairs',
    'Desks',
    'Mousepads',
    'Microphones',
    'Webcams',
    'Lighting',
    'Components',
    'Accessories'
]

// $1,234.50
export const formatMoney = (value) => Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

// Oct 24, 2026 for one day, Oct 20 – Oct 26, 2026 for a longer period
export const formatPeriod = ({ start, end }) => {
    const from = dayjs(start)
    const to = dayjs(end)
    if (start === end) return to.format('MMM D, YYYY')
    return `${from.format(from.year() === to.year() ? 'MMM D' : 'MMM D, YYYY')} – ${to.format('MMM D, YYYY')}`
}

export const errMsg = (message = '') => toast.error(message, {
    position: 'bottom-center'
});
export const successMsg = (message = '') => toast.success(message, {
    position: 'bottom-center'
});

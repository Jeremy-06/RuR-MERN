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

export const ORDER_STATUSES = ['Processing', 'Shipped', 'Delivered']

// $1,234.50
export const formatMoney = (value) => Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

// Oct 31, 2026
export const formatDate = (value) => value ? dayjs(value).format('MMM D, YYYY') : ''

// Oct 31, 2026 · 11:05 PM
export const formatDateTime = (value) => value ? dayjs(value).format('MMM D, YYYY · h:mm A') : ''

const NEW_PRODUCT_DAYS = 14
export const LOW_STOCK = 5
const TOP_RATED = 4.5

// Card badges, all worked out from the product's own data; at most two show
export const productBadges = ({ stock, averageRating, reviewCount, createdAt }) => {
    const badges = []
    if (stock === 0) badges.push({ label: 'Sold out', tone: 'dark' })
    else if (stock <= LOW_STOCK) badges.push({ label: 'Low stock', tone: 'alert' })
    if (reviewCount > 0 && averageRating >= TOP_RATED) badges.push({ label: 'Top rated', tone: 'gold' })
    if (dayjs().diff(dayjs(createdAt), 'day') < NEW_PRODUCT_DAYS) badges.push({ label: 'New', tone: 'blue' })
    return badges.slice(0, 2)
}

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

import { toast } from 'react-toastify';
import * as Yup from 'yup'
import dayjs from 'dayjs'

// Parehong limits sa backend/utils/multer.js
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
export const MAX_IMAGES = 10

export const isAllowedImage = (file) => IMAGE_TYPES.includes(file.type)
export const isAllowedSize = (file) => file.size <= MAX_IMAGE_SIZE

// Parehong rules sa validatePasswords sa backend
const MIN_PASSWORD_LENGTH = 6
export const passwordSchema = Yup.string()
    .required('Please enter your password')
    .min(MIN_PASSWORD_LENGTH, `Your password must be at least ${MIN_PASSWORD_LENGTH} characters`)
export const confirmPasswordSchema = Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords do not match')

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

export const isProductId = (value) => /^[a-f\d]{24}$/i.test(value)

export const formatMoney = (value) => Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 })
export const formatCompactMoney = (value) => compactMoney.format(value)

// Iisang compute ng prices sa lahat ng checkout pages
export const orderPrices = (cartItems) => {
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const shippingPrice = itemsPrice > 200 ? 0 : 25
    const taxPrice = Number((0.05 * itemsPrice).toFixed(2))
    return { itemsPrice, shippingPrice, taxPrice, totalPrice: itemsPrice + shippingPrice + taxPrice }
}

export const formatDate = (value) => value ? dayjs(value).format('MMM D, YYYY') : ''

export const formatDateTime = (value) => value ? dayjs(value).format('MMM D, YYYY · h:mm A') : ''

const NEW_PRODUCT_DAYS = 14
export const LOW_STOCK = 5
const TOP_RATED = 4.5

// Galing sa data ng product; max two badges
export const productBadges = ({ stock, averageRating, reviewCount, createdAt }) => {
    const badges = []
    if (stock === 0) badges.push({ label: 'Sold out', tone: 'dark' })
    else if (stock <= LOW_STOCK) badges.push({ label: 'Low stock', tone: 'alert' })
    if (reviewCount > 0 && averageRating >= TOP_RATED) badges.push({ label: 'Top rated', tone: 'gold' })
    if (dayjs().diff(dayjs(createdAt), 'day') < NEW_PRODUCT_DAYS) badges.push({ label: 'New', tone: 'blue' })
    return badges.slice(0, 2)
}

export const formatPeriod = ({ start, end }) => {
    const from = dayjs(start)
    const to = dayjs(end)
    if (start === end) return to.format('MMM D, YYYY')
    return `${from.format(from.year() === to.year() ? 'MMM D' : 'MMM D, YYYY')} – ${to.format('MMM D, YYYY')}`
}

export const isShop = (pathname) => pathname === '/' || pathname.startsWith('/search/')

// Body o #root ang nag-i-scroll dito, hindi laging window
export const scrollPageToTop = () => {
    [document.scrollingElement, document.body, document.getElementById('root')].forEach(element => {
        if (element) element.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    })
}

export const errMsg = (message = '') => toast.error(message, {
    position: 'bottom-center'
});
export const successMsg = (message = '') => toast.success(message, {
    position: 'bottom-center'
});
export const infoMsg = (message = '') => toast.info(message, {
    position: 'bottom-center'
});

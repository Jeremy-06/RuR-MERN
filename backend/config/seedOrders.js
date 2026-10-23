// Adds a year of demo orders so the sales dashboard has dates to group.
// Run from backend/:  npm run seed:orders          (add)
//                     npm run seed:orders -- --remove   (remove them again)
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env'), quiet: true })

const mongoose = require('mongoose');
const connectDatabase = require('./database');
const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');

// Marks the demo rows so --remove only deletes these
const DEMO_PAYMENT_ID = 'rur_demo_seed'
const DAYS = 365
const DAY = 24 * 60 * 60 * 1000

// Fixed seed so every run creates the same orders
let seed = 318
const random = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
}
const pick = (list) => list[Math.floor(random() * list.length)]

const demoOrder = (products, users, paidAt) => {
    const orderItems = []
    const itemCount = 1 + Math.floor(random() * 3)
    for (let i = 0; i < itemCount; i++) {
        const product = pick(products)
        if (orderItems.some(item => item.product.equals(product._id))) continue
        orderItems.push({
            product: product._id,
            name: product.name,
            price: product.price,
            image: product.images[0].url,
            quantity: 1 + Math.floor(random() * 2),
        })
    }

    // Same prices as checkout (ConfirmOrder.jsx)
    const itemsPrice = Number(orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2))
    const shippingPrice = itemsPrice > 200 ? 0 : 25
    const taxPrice = Number((0.05 * itemsPrice).toFixed(2))

    return {
        orderItems,
        shippingInfo: { address: '318 Demo Street', city: 'Manila', phoneNo: '09171234567', postalCode: '1000', country: 'Philippines' },
        user: pick(users)._id,
        paymentInfo: { id: DEMO_PAYMENT_ID, status: 'succeeded' },
        paidAt,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice: Number((itemsPrice + shippingPrice + taxPrice).toFixed(2)),
        // Delivered orders cannot be processed again, so the demo never changes product stock
        orderStatus: 'Delivered',
        deliveredAt: new Date(Math.min(paidAt.getTime() + 3 * DAY, Date.now())),
        createdAt: paidAt,
    }
}

const demoOrders = (products, users) => {
    const orders = []
    for (let day = DAYS - 1; day >= 0; day--) {
        // Sales grow over the year and are busier on weekends; some days have none
        const date = new Date(Date.now() - day * DAY)
        const weekend = [0, 6].includes(date.getDay()) ? 1.6 : 1
        const expected = (0.6 + 1.6 * (1 - day / DAYS)) * weekend
        const count = Math.round(expected * (0.3 + 1.4 * random()))

        for (let i = 0; i < count; i++) {
            orders.push(demoOrder(products, users, new Date(date.getTime() - random() * DAY)))
        }
    }
    return orders
}

const seedOrders = async () => {
    await connectDatabase()

    if (process.argv.includes('--remove')) {
        const { deletedCount } = await Order.deleteMany({ 'paymentInfo.id': DEMO_PAYMENT_ID })
        console.log(`Removed ${deletedCount} demo orders.`)
        return
    }

    if (await Order.exists({ 'paymentInfo.id': DEMO_PAYMENT_ID })) {
        console.log('Demo orders are already there. Remove them first with: npm run seed:orders -- --remove')
        return
    }

    const products = await Product.find({ 'images.0': { $exists: true } }, 'name price images')
    const customers = await User.find({ role: 'user' }, '_id')
    const users = customers.length > 0 ? customers : await User.find({}, '_id')
    if (products.length === 0 || users.length === 0) {
        console.log('Add products and at least one user first (npm run seed:products, then register an account).')
        process.exitCode = 1
        return
    }

    const orders = await Order.insertMany(demoOrders(products, users))
    console.log(`Added ${orders.length} demo orders over the last ${DAYS} days.`)
}

seedOrders()
    .catch(error => {
        console.log(error.message)
        process.exitCode = 1
    })
    .finally(() => mongoose.disconnect())

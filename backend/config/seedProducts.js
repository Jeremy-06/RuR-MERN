// Adds demo products so the shop list has several pages to scroll.
// Run from backend/:  npm run seed:products          (add)
//                     npm run seed:products -- --remove   (remove them again)
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env'), quiet: true })

const mongoose = require('mongoose');
const Product = require('../models/product');

// Marks the demo rows so --remove only deletes these
const DEMO_SELLER = 'RuR Demo Seed'

const unsplash = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=85`

const imagesByCategory = {
    Keyboards: 'photo-1595225476474-87563907a212',
    Mice: 'photo-1527814050087-3793815479db',
    Headsets: 'photo-1599669454699-248893623440',
    Monitors: 'photo-1625842268584-8f3296236761',
    Controllers: 'photo-1592840496694-26d035b52b48',
    Chairs: 'photo-1616588589676-62b3bd4ff6d2',
    Desks: 'photo-1598550476439-6847785fcea6',
    Mousepads: 'photo-1612287230202-1ff1d85d1bdf',
    Microphones: 'photo-1590602847861-f357a9332bbc',
    Webcams: 'photo-1587826080692-f439cd0b70da',
    Lighting: 'photo-1593305841991-05c297ba4575',
    Components: 'photo-1591799264318-7e6ef8ddb7ea',
    Accessories: 'photo-1616763355548-1b606f439f86',
}

const models = ['Vortex', 'Nimbus', 'Raptor', 'Halo', 'Pulse', 'Strike', 'Zenith', 'Orbit']

const demoProducts = () => {
    const categories = Product.schema.path('category').enumValues
    const products = []
    for (let i = 0; i < 32; i++) {
        const category = categories[i % categories.length]
        const model = models[i % models.length]
        products.push({
            name: `${model} ${category.replace(/s$/, '')} ${100 + i}`,
            category,
            // Spread prices from about $9 to $600
            price: Number((9.99 + ((i * 37) % 60) * 9.75).toFixed(2)),
            stock: (i * 7) % 25,
            seller: DEMO_SELLER,
            description: `Demo ${category.toLowerCase()} for testing the shop list, filters and infinite scroll.`,
            images: [{ public_id: `rur/seed/${imagesByCategory[category]}`, url: unsplash(imagesByCategory[category]) }],
            // One hour apart so "newest first" has a clear order
            createdAt: new Date(Date.now() - (i + 1) * 60 * 60 * 1000),
        })
    }
    return products
}

const seedProducts = async () => {
    await mongoose.connect(process.env.DB_URI)

    if (process.argv.includes('--remove')) {
        const { deletedCount } = await Product.deleteMany({ seller: DEMO_SELLER })
        console.log(`Removed ${deletedCount} demo products.`)
        return
    }

    let created = 0
    for (const product of demoProducts()) {
        if (!(await Product.exists({ name: product.name }))) {
            await Product.create(product)
            created++
        }
    }
    console.log(`Added ${created} demo products. Total products: ${await Product.countDocuments()}`)
}

seedProducts()
    .catch(error => {
        console.log(error.message)
        process.exitCode = 1
    })
    .finally(() => mongoose.disconnect())

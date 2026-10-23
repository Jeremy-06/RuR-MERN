const User = require('../models/user');
const Product = require('../models/product');
const Review = require('../models/review');
const { DEFAULT_AVATAR } = require('../controllers/auth');

const unsplash = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=85`

const sampleProducts = [
    { name: 'Apex Pro TKL Wireless', category: 'Keyboards', price: 189.99, stock: 12, seller: 'RuR Gear', image: 'photo-1595225476474-87563907a212', description: 'Compact tenkeyless mechanical keyboard with adjustable actuation, per-key RGB and 2.4GHz wireless for fast, precise play.' },
    { name: 'Spectra 75 Hot-Swap Keyboard', category: 'Keyboards', price: 129.99, stock: 15, seller: 'RuR Gear', image: 'photo-1618384887929-16ec33fab9ef', description: '75% layout keyboard with hot-swappable switches, gasket mount and PBT keycaps. Small footprint, full function row.' },
    { name: 'Neon RGB Full-Size Keyboard', category: 'Keyboards', price: 99.99, stock: 20, seller: 'Pulse Labs', image: 'photo-1612198188060-c7c2a3b66eae', description: 'Full-size mechanical keyboard with linear switches, media controls and vivid per-key RGB lighting.' },
    { name: 'Phantom X Gaming Mouse', category: 'Mice', price: 79.99, stock: 18, seller: 'RuR Gear', image: 'photo-1527814050087-3793815479db', description: 'Lightweight 58g gaming mouse with a 26K DPI optical sensor and a comfortable ergonomic shape.' },
    { name: 'Vector G Pro Wired Mouse', category: 'Mice', price: 59.99, stock: 25, seller: 'Pulse Labs', image: 'photo-1563297007-0686b7003af7', description: 'Tunable weights, 11 programmable buttons and an RGB logo. Built for MMO and FPS players alike.' },
    { name: 'Pulse 7.1 Headset', category: 'Headsets', price: 129.99, stock: 9, seller: 'Pulse Labs', image: 'photo-1599669454699-248893623440', description: 'Immersive over-ear headset with virtual 7.1 surround, detachable mic and memory-foam cushions.' },
    { name: 'Echo Wireless Headphones', category: 'Headsets', price: 149.99, stock: 11, seller: 'Echo Audio', image: 'photo-1585298723682-7115561c51b7', description: 'Low-latency wireless headphones with 40-hour battery life for long gaming sessions.' },
    { name: 'Strike Wireless Gaming Earbuds', category: 'Headsets', price: 89.99, stock: 30, seller: 'Echo Audio', image: 'photo-1590658268037-6bf12165a8df', description: 'True wireless earbuds with a dedicated low-latency game mode and a pocketable charging case.' },
    { name: 'Horizon 27" 165Hz Gaming Monitor', category: 'Monitors', price: 299.99, stock: 7, seller: 'Vantage Displays', image: 'photo-1625842268584-8f3296236761', description: '27-inch QHD IPS panel with 165Hz refresh rate, 1ms response time and adaptive sync.' },
    { name: 'Clarity 32" 4K Monitor', category: 'Monitors', price: 449.99, stock: 5, seller: 'Vantage Displays', image: 'photo-1527443224154-c4a3942d3acf', description: '32-inch 4K UHD monitor with HDR400 and factory-calibrated color for gaming and creating.' },
    { name: 'Nova Wireless Controller', category: 'Controllers', price: 69.99, stock: 22, seller: 'RuR Gear', image: 'photo-1592840496694-26d035b52b48', description: 'Wireless controller with responsive triggers, textured grips and a rechargeable battery.' },
    { name: 'Edge Pro Controller', category: 'Controllers', price: 74.99, stock: 14, seller: 'RuR Gear', image: 'photo-1606318801954-d46d46d3360a', description: 'Pro controller with adaptive triggers, remappable back buttons and a USB-C braided cable.' },
    { name: 'Throne Ergonomic Gaming Chair', category: 'Chairs', price: 249.99, stock: 6, seller: 'Comfort Command', image: 'photo-1616588589676-62b3bd4ff6d2', description: 'Ergonomic gaming chair with 4D armrests, lumbar support and a 165-degree recline.' },
    { name: 'Command Center L-Shaped Desk', category: 'Desks', price: 329.99, stock: 4, seller: 'Comfort Command', image: 'photo-1598550476439-6847785fcea6', description: 'Spacious L-shaped desk with cable management tray, monitor shelf and carbon-fiber finish.' },
    { name: 'Glacier XL Desk Mat', category: 'Mousepads', price: 34.99, stock: 24, seller: 'RuR Gear', image: 'photo-1612287230202-1ff1d85d1bdf', description: 'Smooth extended desk surface with stitched edges and room for your full loadout.' },
    { name: 'Ambient LED Strip Kit', category: 'Lighting', price: 39.99, stock: 28, seller: 'Glow Works', image: 'photo-1593305841991-05c297ba4575', description: 'App-controlled RGB LED strips that sync with your games and music for the perfect setup glow.' },
    { name: 'Monitor Arm & Headphone Stand Kit', category: 'Accessories', price: 59.99, stock: 16, seller: 'RuR Gear', image: 'photo-1616763355548-1b606f439f86', description: 'Gas-spring monitor arm plus aluminum headphone stand to free up desk space.' },
]

const legacyCategories = {
    Audio: 'Headsets',
    'Desk setup': 'Mousepads',
}

// Reviews used to live inside each product (reviews, ratings, numOfReviews); move them to the reviews collection
async function migrateEmbeddedReviews() {
    const products = await Product.collection.find({
        $or: [{ reviews: { $exists: true } }, { ratings: { $exists: true } }, { numOfReviews: { $exists: true } }]
    }).toArray()

    for (const product of products) {
        for (const review of product.reviews || []) {
            // Copied as they were; the bad-words check only applies to new and edited reviews
            await Review.collection.updateOne(
                { product: product._id, user: review.user },
                { $setOnInsert: { rating: review.rating, comment: review.comment, createdAt: review._id.getTimestamp() } },
                { upsert: true }
            )
        }
        await Product.collection.updateOne({ _id: product._id }, { $unset: { reviews: '', ratings: '', numOfReviews: '' } })
        await Review.updateProductRating(product._id)
    }
    if (products.length > 0) console.log(`Moved reviews of ${products.length} product(s) to the reviews collection.`);
}

async function seedDatabase() {
    await migrateEmbeddedReviews()

    // Older RuR records stored a single `image` string; convert them to the `images` array format
    const legacyProducts = await Product.collection.find({ images: { $exists: false } }).toArray()
    for (const legacy of legacyProducts) {
        await Product.collection.updateOne({ _id: legacy._id }, {
            $set: {
                images: legacy.image ? [{ public_id: 'rur/legacy', url: legacy.image }] : [],
                seller: legacy.seller || 'RuR Gear',
                description: legacy.description || legacy.name,
                category: legacyCategories[legacy.category] || legacy.category,
                averageRating: 0,
                reviewCount: 0,
            },
            $unset: { image: '', featured: '' },
        })
    }
    await User.updateMany({ avatar: { $exists: false } }, { avatar: DEFAULT_AVATAR })

    const { DEFAULT_ADMIN_NAME, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } = process.env;
    if (DEFAULT_ADMIN_EMAIL && DEFAULT_ADMIN_PASSWORD) {
        const email = DEFAULT_ADMIN_EMAIL.trim().toLowerCase();
        const admin = await User.findOne({ email });
        if (!admin) {
            await User.create({
                name: DEFAULT_ADMIN_NAME || 'RuR Administrator',
                email,
                password: DEFAULT_ADMIN_PASSWORD,
                avatar: DEFAULT_AVATAR,
                role: 'admin',
            });
            console.log('Created the default admin account.');
        } else if (admin.role !== 'admin') {
            admin.role = 'admin';
            await admin.save({ validateBeforeSave: false });
        }
    }

    if (legacyProducts.length > 0 || await Product.countDocuments() === 0) {
        for (const { image, ...product } of sampleProducts) {
            if (!(await Product.exists({ name: product.name }))) {
                await Product.create({
                    ...product,
                    images: [{ public_id: `rur/seed/${image}`, url: unsplash(image) }],
                })
            }
        }
        console.log('Seeded the gaming gear catalog.');
    }
}

module.exports = seedDatabase;

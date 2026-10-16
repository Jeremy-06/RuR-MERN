const User = require('../models/user');
const Product = require('../models/product');

const sampleProducts = [
    { name: 'Apex Pro TKL Wireless', category: 'Keyboards', price: 189.99, stock: 12, featured: true, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=700&q=85', description: 'Compact mechanical keyboard built for fast, precise play.' },
    { name: 'Phantom X Gaming Mouse', category: 'Mice', price: 79.99, stock: 18, featured: true, image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=700&q=85', description: 'Lightweight gaming mouse with a comfortable ergonomic shape.' },
    { name: 'Pulse 7.1 Headset', category: 'Audio', price: 129.99, stock: 9, featured: true, image: 'https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=700&q=85', description: 'Immersive over-ear headset for games, calls, and music.' },
    { name: 'Glacier XL Desk Mat', category: 'Desk setup', price: 34.99, stock: 24, featured: true, image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=700&q=85', description: 'Smooth extended desk surface with room for your full loadout.' },
];

async function seedDatabase() {
    const { DEFAULT_ADMIN_NAME, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } = process.env;
    if (!DEFAULT_ADMIN_EMAIL || !DEFAULT_ADMIN_PASSWORD) {
        throw new Error('Set DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD in backend/config/.env.');
    }
    if (DEFAULT_ADMIN_PASSWORD.length < 12) {
        throw new Error('DEFAULT_ADMIN_PASSWORD must be at least 12 characters long.');
    }

    const email = DEFAULT_ADMIN_EMAIL.trim().toLowerCase();
    let admin = await User.findOne({ email }).select('+password');
    if (!admin) {
        admin = await User.create({
            name: DEFAULT_ADMIN_NAME?.trim() || 'RuR Administrator',
            email,
            password: DEFAULT_ADMIN_PASSWORD,
            role: 'admin',
        });
        console.log('Created the configured default administrator account.');
    } else if (admin.role !== 'admin') {
        admin.role = 'admin';
        await admin.save();
        console.log('Granted administrator role to the configured default account.');
    }

    if (await Product.estimatedDocumentCount() === 0) {
        await Product.insertMany(sampleProducts);
        console.log('Added the starter gaming gear catalog.');
    }
}

module.exports = seedDatabase;

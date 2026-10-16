const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, 'config', '.env') });
const connectDatabase = require('./config/database');
const seedDatabase = require('./config/seed');
const app = require('./app');

const port = process.env.PORT || 4001;
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Add it to backend/config/.env.');
}

connectDatabase()
    .then(seedDatabase)
    .then(() => {
        app.listen(port, () => {
            console.log(`RuR backend listening on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    });

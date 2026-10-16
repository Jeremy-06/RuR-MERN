const mongoose = require('mongoose');

async function connectDatabase() {
    const connectionString = process.env.DB_URI;
    if (!connectionString) {
        throw new Error('DB_URI is not set. Add it to backend/config/.env.');
    }

    const connection = await mongoose.connect(connectionString);
    console.log(`MongoDB connected to ${connection.connection.host}/${connection.connection.name}`);
}

module.exports = connectDatabase;

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, 'config', '.env') })

// Stop early with a clear message when a required env variable is missing
const requiredEnv = [
    'PORT',
    'DB_URI',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
]
const missingEnv = requiredEnv.filter(key => !process.env[key])
if (missingEnv.length > 0) {
    missingEnv.forEach(key => console.log(`ERROR: Missing required environment variable ${key} in backend/config/.env`))
    process.exit(1);
}

// Node can pick up 127.0.0.1 as its only DNS server on Windows, which breaks the
// SRV lookup for mongodb+srv:// URIs (querySrv ECONNREFUSED); fall back to public DNS
const dns = require('dns');
if (dns.getServers().every(server => ['127.0.0.1', '::1'].includes(server))) {
    dns.setServers((process.env.DNS_SERVERS || '8.8.8.8,1.1.1.1').split(',').map(server => server.trim()))
}

const app = require('./app');
const connectDatabase = require('./config/database')
const connectCloudinary = require('./config/cloudinary')
const { connectFirebase } = require('./config/firebase')
const seedDatabase = require('./config/seed')
const { registerOrderListeners } = require('./listeners/orderListener')

connectDatabase().then(seedDatabase).catch(error => console.log(error.message));
connectCloudinary()
connectFirebase()
registerOrderListeners()

app.listen(process.env.PORT, (error) => {
    if (error) {
        console.log(`server failed to start on port ${process.env.PORT}: ${error.message}`);
        process.exit(1);
    }
    console.log(`server started on port: ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
});

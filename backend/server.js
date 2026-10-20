const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, 'config', '.env') })

const app = require('./app');
const connectDatabase = require('./config/database')
const seedDatabase = require('./config/seed')
const cloudinary = require('cloudinary');

connectDatabase().then(seedDatabase).catch(error => console.log(error.message));
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

app.listen(process.env.PORT, (error) => {
    if (error) {
        console.log(`server failed to start on port ${process.env.PORT}: ${error.message}`);
        process.exit(1);
    }
    console.log(`server started on port: ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
});

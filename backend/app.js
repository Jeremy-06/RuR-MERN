const express = require('express');
const app = express();
const cors = require('cors')
const cookieParser = require('cookie-parser')
const products = require('./routes/product');
const auth = require('./routes/auth');
const order = require('./routes/order');
const review = require('./routes/review');

app.use(cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Pang-gising sa free server bago mag-demo, walang DB call
app.get('/api/v1/health', (req, res) => res.status(200).json({ success: true }));

app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1', order);
app.use('/api/v1', review);

app.use((err, req, res, next) => {
    let statusCode = err.statusCode || 500
    let message = err.message

    if (err.name === 'ValidationError') {
        statusCode = 400
        message = Object.values(err.errors).map(value => value.message).join(', ')
    }

    // Dalawang sabay na request, tumama sa unique index (hal. parehong review)
    if (err.code === 11000) {
        statusCode = 409
        message = 'This record already exists'
    }

    if (err.name === 'MulterError') {
        statusCode = 400
        if (err.code === 'LIMIT_FILE_SIZE') message = 'Each image must be 5MB or smaller'
        if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') message = 'You can upload up to 10 images at a time in the "images" field'
    }

    // Server errors lang ang kailangan ng stack trace
    if (statusCode >= 500) console.log(err)
    return res.status(statusCode).json({ message })
})

module.exports = app

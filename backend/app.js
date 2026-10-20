const express = require('express');
const app = express();
const cors = require('cors')
const cookieParser = require('cookie-parser')
const products = require('./routes/product');
const auth = require('./routes/auth');
const order = require('./routes/order');

app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1', order);

app.use((err, req, res, next) => {
    console.log(err)
    const message = err.name === 'ValidationError'
        ? Object.values(err.errors).map(value => value.message).join(', ')
        : err.message
    return res.status(err.name === 'ValidationError' ? 400 : 500).json({ message })
})

module.exports = app

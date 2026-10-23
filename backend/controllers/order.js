const Order = require('../models/order');
const Product = require('../models/product');
const { orderEvents, ORDER_CREATED, ORDER_STATUS_UPDATED } = require('../events/orderEvents');
const { parseSalesRange } = require('../utils/salesRange');

// Create a new order   =>  /api/v1/order/new
exports.newOrder = async (req, res, next) => {
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo
    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user._id
    })

    res.status(200).json({
        success: true,
        order
    })

    // Receipt PDF and confirmation email are built after responding so checkout stays fast
    orderEvents.emit(ORDER_CREATED, {
        order: { ...order.toObject(), user: { _id: req.user._id, name: req.user.name, email: req.user.email } }
    })
}

exports.myOrders = async (req, res, next) => {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.status(200).json({
        success: true,
        orders
    })
}

exports.getSingleOrder = async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')
    if (!order) {
        return res.status(404).json({
            message: 'No Order found with this ID',
        })
    }
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            message: 'You are not allowed to view this order',
        })
    }
    res.status(200).json({
        success: true,
        order
    })
}

exports.allOrders = async (req, res, next) => {
    const orders = await Order.find().sort({ createdAt: -1 })
    let totalAmount = 0;

    orders.forEach(order => {
        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
}

exports.deleteOrder = async (req, res, next) => {
    const order = await Order.findByIdAndDelete(req.params.id)

    if (!order) {
        return res.status(404).json({
            message: 'No Order found with this ID',
        })
    }
    return res.status(200).json({
        success: true
    })
}

// Update order status, then email the receipt in the background   =>  /api/v1/admin/order/:id
exports.updateOrder = async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')
    if (!order) {
        return res.status(404).json({
            message: 'No Order found with this ID',
        })
    }
    if (order.orderStatus === 'Delivered') {
        return res.status(400).json({
            message: 'You have already delivered this order',
        })
    }

    // Deduct stock once, when the order is delivered
    if (req.body.status === 'Delivered') {
        for (const item of order.orderItems) {
            await updateStock(item.product, item.quantity)
        }
        order.deliveredAt = Date.now()
    }

    const previousStatus = order.orderStatus
    order.orderStatus = req.body.status
    await order.save()
    res.status(200).json({
        success: true,
    })

    // Emitted after responding so the PDF and email never delay the admin; a plain copy keeps listeners off the live document
    if (previousStatus !== order.orderStatus) {
        orderEvents.emit(ORDER_STATUS_UPDATED, { order: order.toObject(), previousStatus })
    }
}

async function updateStock(id, quantity) {
    const product = await Product.findById(id);
    if (!product) return;

    product.stock = Math.max(product.stock - quantity, 0);

    await product.save({ validateBeforeSave: false })
}

exports.totalOrders = async (req, res, next) => {
    const totalOrders = await Order.aggregate([
        {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }
    ])
    res.status(200).json({
        success: true,
        totalOrders
    })
}

exports.totalSales = async (req, res, next) => {
    const totalSales = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalSales: { $sum: "$totalPrice" }
            }
        }
    ])
    res.status(200).json({
        success: true,
        totalSales
    })
}

exports.customerSales = async (req, res, next) => {
    const customerSales = await Order.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userDetails'
            },
        },
        { $unwind: "$userDetails" },
        {
            $group: {
                _id: "$user",
                total: { $sum: "$totalPrice" },
                doc: { "$first": "$$ROOT" },
            }
        },
        {
            $replaceRoot: {
                newRoot: { $mergeObjects: [{ total: '$total' }, '$doc'] },
            },
        },
        {
            $project: {
                _id: 0,
                "userDetails.name": true,
                total: true,
            }
        },
        { $sort: { total: 1 } },
    ])

    res.status(200).json({
        success: true,
        customerSales
    })
}

exports.salesPerMonth = async (req, res, next) => {
    const salesPerMonth = await Order.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: "$paidAt" },
                    month: { $month: "$paidAt" }
                },
                total: { $sum: "$totalPrice" },
            },
        },
        {
            $addFields: {
                month: {
                    $let: {
                        vars: {
                            monthsInString: [, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
                        },
                        in: {
                            $concat: [
                                { $arrayElemAt: ['$$monthsInString', "$_id.month"] },
                                ' ',
                                { $toString: "$_id.year" }
                            ]
                        }
                    }
                }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        {
            $project: {
                _id: 0,
                month: true,
                total: true,
            }
        }
    ])

    res.status(200).json({
        success: true,
        salesPerMonth
    })
}

// Sales per day, week or month in a date range   =>  /api/v1/admin/sales-by-date?startDate=2026-10-01&endDate=2026-10-24&groupBy=day&timezone=Asia/Manila
exports.salesByDate = async (req, res, next) => {
    const range = parseSalesRange(req.query)
    if (range.error) {
        return res.status(400).json({
            success: false,
            message: range.error
        })
    }
    const { startDate, endDate, groupBy, timezone, periods } = range

    // An order counts on the day it was paid, in the admin's time zone (createdAt if paidAt is missing)
    const soldAt = { $ifNull: ['$paidAt', '$createdAt'] }
    const periodStart = {
        $dateTrunc: { date: soldAt, unit: groupBy, timezone, ...(groupBy === 'week' && { startOfWeek: 'monday' }) }
    }

    const sales = await Order.aggregate([
        {
            $addFields: {
                soldOn: { $dateToString: { format: '%Y-%m-%d', date: soldAt, timezone } }
            }
        },
        { $match: { soldOn: { $gte: startDate, $lte: endDate } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: periodStart, timezone } },
                total: { $sum: '$totalPrice' },
                orders: { $sum: 1 },
                items: { $sum: { $sum: '$orderItems.quantity' } },
            }
        },
    ])

    // Periods without orders are filled in with 0 so the chart has no gaps
    const salesByPeriod = new Map(sales.map(period => [period._id, period]))
    const salesByDate = periods.map(({ key, start, end }) => {
        const period = salesByPeriod.get(key)
        return {
            start,
            end,
            total: period ? Math.round(period.total * 100) / 100 : 0,
            orders: period ? period.orders : 0,
            items: period ? period.items : 0,
        }
    })

    let totalSales = 0
    let totalOrders = 0
    let totalItems = 0
    salesByDate.forEach(period => {
        totalSales += period.total
        totalOrders += period.orders
        totalItems += period.items
    })

    res.status(200).json({
        success: true,
        startDate,
        endDate,
        groupBy,
        timezone,
        totalSales: Math.round(totalSales * 100) / 100,
        totalOrders,
        totalItems,
        sales: salesByDate
    })
}

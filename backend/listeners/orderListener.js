const fs = require('fs/promises');
const path = require('path');
const ejs = require('ejs');
const { orderEvents, ORDER_CREATED, ORDER_STATUS_UPDATED } = require('../events/orderEvents');
const generatePdf = require('../utils/generatePdf');
const sendEmail = require('../utils/sendEmail');

const receiptTemplate = path.join(__dirname, '..', 'templates', 'orderReceipt.ejs');
const receiptsDir = path.join(__dirname, '..', 'storage', 'receipts');

const formatMoney = value => `$${Number(value || 0).toFixed(2)}`;

// Builds the receipt PDF, saves it in storage/receipts, then emails it to the customer   =>  emitted by newOrder and updateOrder
const sendOrderReceipt = async ({ order, previousStatus }) => {
    const data = {
        order,
        items: order.orderItems,
        subtotal: order.itemsPrice,
        grandTotal: order.totalPrice,
        isNewOrder: !previousStatus,
        formatMoney
    };

    // Same template for both; the email version mentions the attached PDF
    const [emailHtml, pdfHtml] = await Promise.all([
        ejs.renderFile(receiptTemplate, { ...data, isEmail: true }),
        ejs.renderFile(receiptTemplate, { ...data, isEmail: false })
    ]);
    const pdf = await generatePdf(pdfHtml);

    // One file per order; a status update replaces it with the latest receipt
    const filename = `RuR-receipt-${order._id}.pdf`;
    await fs.mkdir(receiptsDir, { recursive: true });
    await fs.writeFile(path.join(receiptsDir, filename), pdf);

    const customerEmail = order.user && order.user.email;
    if (!customerEmail) {
        console.log(`Receipt ${filename} saved but not emailed: the customer has no email`);
        return;
    }
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        console.log(`Receipt ${filename} saved but not emailed: add the Mailtrap SMTP_EMAIL and SMTP_PASSWORD to backend/config/.env`);
        return;
    }

    await sendEmail({
        email: customerEmail,
        subject: previousStatus ? `RuR Order #${order._id} is now ${order.orderStatus}` : `RuR Order #${order._id} confirmed`,
        html: emailHtml,
        attachments: [{
            filename,
            content: pdf,
            contentType: 'application/pdf'
        }]
    });
    console.log(`Receipt ${filename} saved and sent to ${customerEmail}`);
}

const registerOrderListeners = () => {
    orderEvents.on(ORDER_CREATED, sendOrderReceipt);
    orderEvents.on(ORDER_STATUS_UPDATED, sendOrderReceipt);
}

module.exports = { registerOrderListeners, sendOrderReceipt };

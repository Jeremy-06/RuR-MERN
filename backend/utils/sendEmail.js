const nodemailer = require('nodemailer');

// Waits before each retry when Mailtrap says too many emails were sent
const RETRY_DELAYS = [5000, 10000, 15000];

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const isRateLimited = error => error.responseCode === 429
    || /too many (emails|messages|requests)|rate limit/i.test(`${error.response} ${error.message}`);

const sendEmail = async options => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    const message = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.html || `<p>${options.message}</p>`,
        attachments: options.attachments
    }

    // Only rate limit errors are retried; anything else is thrown right away
    for (let retry = 0; ; retry++) {
        try {
            return await transporter.sendMail(message)
        } catch (error) {
            if (!isRateLimited(error)) throw error
            if (retry === RETRY_DELAYS.length) {
                console.log(`"${options.subject}" not sent after ${retry} retries`)
                throw error
            }
            console.log(`"${options.subject}" hit the Mailtrap rate limit, retry ${retry + 1} of ${RETRY_DELAYS.length} in ${RETRY_DELAYS[retry] / 1000}s`)
            await wait(RETRY_DELAYS[retry])
        }
    }
}

module.exports = sendEmail;

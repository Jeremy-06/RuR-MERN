const puppeteer = require('puppeteer');

// Isang browser lang para sa lahat ng PDF
let browserPromise = null;

const getBrowser = () => {
    if (!browserPromise) {
        browserPromise = puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        }).catch(error => {
            browserPromise = null;
            throw error;
        });
        browserPromise.then(browser => browser.on('disconnected', () => { browserPromise = null }), () => {});
    }
    return browserPromise;
}

const generatePdf = async html => {
    const browser = await getBrowser();
    const page = await browser.newPage();
    try {
        await page.setContent(html, { waitUntil: 'load' });
        const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '16mm', bottom: '16mm', left: '12mm', right: '12mm' } });
        return Buffer.from(pdf);
    } finally {
        await page.close();
    }
}

module.exports = generatePdf;

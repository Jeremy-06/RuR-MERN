const { EventEmitter } = require('events');

const ORDER_CREATED = 'order:created';
const ORDER_STATUS_UPDATED = 'order:statusUpdated';

// captureRejections turns a rejected async listener into an 'error' event instead of an unhandled rejection
const orderEvents = new EventEmitter({ captureRejections: true });

// Without an 'error' listener Node would throw and stop the server
orderEvents.on('error', error => console.log(`Order event failed: ${error.message}`));

module.exports = { orderEvents, ORDER_CREATED, ORDER_STATUS_UPDATED };

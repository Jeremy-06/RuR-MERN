const { EventEmitter } = require('events');

const ORDER_CREATED = 'order:created';
const ORDER_STATUS_UPDATED = 'order:statusUpdated';

// Para maging 'error' event ang rejected async listener, hindi unhandled rejection
const orderEvents = new EventEmitter({ captureRejections: true });

// Kapag walang 'error' listener, babagsak ang server
orderEvents.on('error', error => console.log(`Order event failed: ${error.message}`));

module.exports = { orderEvents, ORDER_CREATED, ORDER_STATUS_UPDATED };

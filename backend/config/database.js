const dns = require('dns');
const mongoose = require('mongoose');

// Sa Windows minsan 127.0.0.1 lang ang DNS ni Node, kaya pumapalya ang SRV lookup
// ng mongodb+srv:// (querySrv ECONNREFUSED); public DNS ang fallback
const useReachableDns = () => {
    if (dns.getServers().every(server => ['127.0.0.1', '::1'].includes(server))) {
        dns.setServers((process.env.DNS_SERVERS || '8.8.8.8,1.1.1.1').split(',').map(server => server.trim()))
    }
}

const connectDatabase = () => {
    useReachableDns()
    return mongoose.connect(process.env.DB_URI).then(con => {
        console.log(`MongoDB Database connected with HOST: ${con.connection.host}`)
    })
}

module.exports = connectDatabase

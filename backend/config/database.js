const dns = require('dns');
const mongoose = require('mongoose');

// Node can pick up 127.0.0.1 as its only DNS server on Windows, which breaks the
// SRV lookup for mongodb+srv:// URIs (querySrv ECONNREFUSED); fall back to public DNS
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

const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

let firebaseAuth = null

const connectFirebase = () => {
    // Relative paths in .env are resolved from the backend folder
    const serviceAccountPath = path.resolve(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './config/firebase-service-account.json')

    if (!fs.existsSync(serviceAccountPath)) {
        console.log(`WARNING: Firebase service account file not found at ${serviceAccountPath}. Google login is disabled until the file is added.`)
        return
    }

    try {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))
        firebaseAuth = getAuth(initializeApp({ credential: cert(serviceAccount) }))
        console.log(`Firebase Admin initialized for project: ${serviceAccount.project_id}`)
    } catch (error) {
        console.log(`WARNING: Firebase service account file is invalid (${error.message}). Google login is disabled.`)
    }
}

// Returns null when Google login is disabled
const getFirebaseAuth = () => firebaseAuth

module.exports = { connectFirebase, getFirebaseAuth }

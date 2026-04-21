/**
 * Firebase Realtime Database — REST API client
 * Works without authentication if your DB rules allow read/write.
 *
 * In Firebase Console → Realtime Database → Rules, make sure you have:
 * {
 *   "rules": {
 *     ".read": true,
 *     ".write": true
 *   }
 * }
 */

const https = require('https');

const DB_URL = 'https://leadradar-bc285-default-rtdb.firebaseio.com';

// Optional: add secret if you have it, otherwise leave blank
const SECRET = process.env.FIREBASE_DB_SECRET || '';

function firebaseRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const authParam = SECRET ? `?auth=${SECRET}` : '';
    const fullPath = `/leads${path}.json${authParam}`;

    const payload = body ? JSON.stringify(body) : null;

    const options = {
      hostname: 'leadradar-bc285-default-rtdb.firebaseio.com',
      path: fullPath,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const db = {
  push:   (data)        => firebaseRequest('POST',   '',          data),
  getAll: ()            => firebaseRequest('GET',    '',          null),
  update: (id, data)    => firebaseRequest('PATCH',  `/${id}`,    data),
  remove: (id)          => firebaseRequest('DELETE', `/${id}`,    null),
};

module.exports = { db };

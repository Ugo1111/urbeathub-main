// setAdminClaim.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.setAdminClaim = functions.https.onRequest(async (req, res) => {
  const uid = req.query.uid; // Retrieve UID from the query string

  if (!uid) {
    return res.status(400).send('Missing UID');
  }

  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`Admin claim set for user with UID: ${uid}`);
    res.send(`Admin claim set for user with UID: ${uid}`);
  } catch (error) {
    console.error('Error setting custom claim:', error);
    res.status(500).send('Error setting custom claim');
  }
});

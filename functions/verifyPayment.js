

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Check if an app is already initialized to avoid duplicate initialization
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const paystackSecretKey = 'sk_test_a8879f2aae912c54848e3e4b838e5328903850df'; // Replace with your Paystack secret key

exports.verifyPayment = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
  } else if (req.method === 'POST') {
    const { reference, email, name, song, license, amount, uid } = req.body;

    axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
      },
    })
    .then(response => {
      if (response.data.status) {
        // Payment is verified, save to Firestore
        const userDocRef = db.collection('beatHubUsers').doc(uid);
        return userDocRef.update({
          purchases: admin.firestore.FieldValue.arrayUnion({
            email,
            name,
            song,
            license,
            amount,
            currency: 'NGN',
            reference,
            timestamp: admin.firestore.Timestamp.now(),
          }),
        });
      } else {
        throw new Error('Payment verification failed');
      }
    })
    .then(() => {
      res.status(200).send({ message: 'Payment verified successfully' });
    })
    .catch(error => {
      console.error('Error verifying payment:', error);
      res.status(500).send({ message: `Error verifying payment: ${error.message}` });
    });
  } else {
    res.status(405).send({ message: 'Method not allowed' });
  }
});

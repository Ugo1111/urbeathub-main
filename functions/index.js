/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const setAdminClaim = require('./setAdminClaim');
//const verifyPayment = require('./verifyPayment');
const functions = require("firebase-functions");
const stripe = require("stripe")("sk_test_51RXqNECrqHNtK1Twhph01eEpUToF0KKE75spaAN7isZFZC0uRxv44uPTxyuOtqBkwZq1A9JDNFt3fgMa9FFPGaLC00VMqL8W3t"); // Replace with your Stripe secret key


const { calculateUpgradePrice } = require('./calculateUpgradePrice');

exports.calculateUpgradePrice = calculateUpgradePrice;




exports.setAdminClaim = setAdminClaim.setAdminClaim;
//exports.verifyPayment = verifyPayment.verifyPayment;

// exports.createPaymentIntent = functions.https.onRequest(async (req, res) => {
//   try {
//     const { amount, email } = req.body;

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amount * 100, // Convert amount to cents
//       currency: "usd",
//       receipt_email: email,
//     });

//     res.json({ clientSecret: paymentIntent.client_secret }); 
//   } catch (error) {
//     console.error("Error creating payment intent:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


exports.stripeVerificationWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = "whsec_raEv2YFgC077ekEc7mDBltvWbtCGA4jg"; // paste your webhook signing secret from Stripe Dashboard
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    console.log("✅ Payment succeeded:", pi.id);
    // TODO: save purchase to Firestore here
  } else {
    console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});
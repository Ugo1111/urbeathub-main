
const setAdminClaim = require('./setAdminClaim');
//const verifyPayment = require('./verifyPayment');
const functions = require("firebase-functions");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || functions.config().stripe.secret);
  require("dotenv").config(); // ✅ Load .env variables at startup


const { calculateUpgradePrice } = require('./calculateUpgradePrice');

exports.calculateUpgradePrice = calculateUpgradePrice;

const { createPaymentIntent } = require("./createPaymentIntent");
exports.createPaymentIntent = createPaymentIntent;


exports.setAdminClaim = setAdminClaim.setAdminClaim;

const verifyPayment = require('./verifypayment');
exports.verifyPayment = verifyPayment.verifyPayment;



const { handleStripeWebhook } = require('./handleStripeWebhook');

// Expose the functions to Firebase

exports.handleStripeWebhook = handleStripeWebhook;


const { initializePaystackPayment } = require("./initializePaystackPayment");

exports.initializePaystackPayment = initializePaystackPayment;


const { paystackWebhook } = require("./paystackWebhook");
exports.paystackWebhook = paystackWebhook;


// 🔥 Prerender function export
exports.prerender = functions.https.onRequest(async (req, res) => {
  const fetch = require("node-fetch");
  const PRERENDER_TOKEN = process.env.PRERENDER_TOKEN || "YOUR_PRERENDER_TOKEN_HERE";

  try {
    const prerenderUrl = `https://service.prerender.io${req.url}`;
    const prerenderRes = await fetch(prerenderUrl, {
      headers: { "X-Prerender-Token": PRERENDER_TOKEN },
    });
    const html = await prerenderRes.text();
    res.set("Cache-Control", "public, max-age=3600");
    res.status(prerenderRes.status).send(html);
  } catch (err) {
    console.error("Prerender error:", err);
    res.status(500).send("Prerender failed");
  }
});
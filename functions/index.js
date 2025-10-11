
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

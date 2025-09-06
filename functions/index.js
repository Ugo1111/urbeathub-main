
const setAdminClaim = require('./setAdminClaim');
//const verifyPayment = require('./verifyPayment');
const functions = require("firebase-functions");
const stripe = require("stripe")("sk_test_51RXqNECrqHNtK1Twhph01eEpUToF0KKE75spaAN7isZFZC0uRxv44uPTxyuOtqBkwZq1A9JDNFt3fgMa9FFPGaLC00VMqL8W3t"); // Replace with your Stripe secret key


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

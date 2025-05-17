import React from 'react';
import "../css/addToCart.css";
import { GroupF, GroupG } from "../component/footer";
import { Helmet } from 'react-helmet';
import GroupA from "../component/header.js";

function RefundPolicy() {
  return (
    <>
    <Helmet>
                <title>Refund Policy</title>
              </Helmet>
      <GroupA />
      <div className="refund-policy-container">
        <h1>Refund Policy for Ur BeatHub</h1>
        <p>
          All sales on <strong>Ur BeatHub</strong> are final due to the digital nature of our products. Refunds are only issued if:
        </p>
        <ul>
          <li>The purchased beat was not delivered due to a technical error.</li>
          <li>The delivered file is corrupted and cannot be replaced.</li>
        </ul>
        <p>
          To request a refund, contact us at <a href="mailto:info@urbeathub.com">info@urbeathub.com</a> within 7 days of purchase with your order details. We will review your request and respond within 3-5 business days.
        </p>
        <p>
          By purchasing from Ur BeatHub, you agree to this refund policy.
        </p>
      </div>
      <GroupF /> {/* Footer Wrapper */}
      <GroupG /> {/* Footer */}
    </>
  );
}

export default RefundPolicy;

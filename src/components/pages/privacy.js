import React from 'react';
import "../css/addToCart.css";
import { GroupF, GroupG } from "../component/footer"; // Import GroupF and GroupG for the footer
import { Helmet } from 'react-helmet';

function Privacy() {
  return (
    <>
    <Helmet>
            <title>Privacy Policy</title>
          </Helmet>
    <div>
    <div className="privacy-policy">
      <h2>Privacy Policy</h2>
      <p> 
        This Privacy Policy describes the policies of UrBeat Hub, 26 Redfearn Walk, Marsh House Lane, Warrington, Cheshire, England, WA2 7EF, 
        email: <a href="mailto:info@urbeathub.com">info@urbeathub.com</a>, phone: 7942053507, on the collection, 
        use, and disclosure of your information when you use our website (<a href="https://urbeathub.com">https://urbeathub.com</a>). 
        By accessing or using the Service, you consent to the collection, use, and disclosure of your information in 
        accordance with this Privacy Policy. If you do not agree, please do not use the Service.
      </p>
      
      <p>
        We may modify this Privacy Policy at any time without prior notice. The revised Policy will be effective 180 days 
        from its posting on the Service, and continued use after this period will indicate your acceptance. We recommend 
        reviewing this page periodically.
      </p>

      <h3>Information We Collect</h3>
      <p>We collect and process the following personal information:</p>
      <ul>
        <li>Name</li>
        <li>Email</li>
        <li>Mobile</li>
        <li>Date of Birth</li>
        <li>Address</li>
        <li>Payment Information</li>
      </ul>

      <h3>How We Use Your Information</h3>
      <p>We use collected information for the following purposes:</p>
      <ul>
        <li>Creating user accounts</li>
        <li>Customer feedback collection</li>
        <li>Processing payments</li>
        <li>Managing customer orders</li>
        <li>Managing user accounts</li>
      </ul>
      <p>
        If we need to use your data for any other purpose, we will seek your consent before doing so unless required by law.
      </p>

      <h3>Retention of Your Information</h3>
      <p>
        We will retain your data for 90 days to 2 years after account termination or as long as necessary for the collected 
        purpose. Some data may be retained longer for legal compliance, fraud prevention, and enforcement of rights.
      </p>

      <h3>Your Rights</h3>
      <p>
        Depending on applicable laws, you may have rights to access, rectify, erase, or restrict processing of your personal data. 
        You may also request data transfer, withdraw consent, or file complaints with authorities. To exercise these rights, contact 
        us at <a href="mailto:info@urbeathub.com">info@urbeathub.com</a>. We will respond as per applicable laws.
      </p>

      <h3>Cookies</h3>
      <p>
        For information on how we use cookies and tracking technologies, please refer to our <a href="/cookie-policy">Cookie Policy</a>.
      </p>

      <h3>Security</h3>
      <p>
        We take reasonable security measures to protect your data but cannot guarantee absolute security. Transmitting data is at your own risk.
      </p>

      <h3>Grievance / Data Protection Officer</h3>
      <p>
        If you have concerns about data processing, contact our Grievance Officer at:
      </p>
      <address>
        UrBeat Hub, 26 Redfearn Walk, Marsh House Lane, Warrington, Cheshire, England, WA2 7EF<br />
        Email: <a href="mailto:info@urbeathub.com">info@urbeathub.com</a>
      </address>
    </div>
<GroupF />
<GroupG />
    </div>
    </>
  );
}

export default Privacy;

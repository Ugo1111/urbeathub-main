import React, { useState, useEffect } from 'react';
import PaystackPayment from '../component/PaystackPayment';
import { useLocation, useNavigate } from 'react-router-dom';


const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalPrice, userEmail, userName, song, license, uid } = location.state || {};
  const [email, setEmail] = useState(userEmail || '');
  const [name, setName] = useState(userName || '');
  const [amount, setAmount] = useState(totalPrice || 0);

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleNameChange = (e) => setName(e.target.value);

  useEffect(() => {
    if (totalPrice) {
      setAmount(totalPrice);
    }
    if (userEmail) {
      setEmail(userEmail);
    }
    if (userName) {
      setName(userName);
    }
  }, [totalPrice, userEmail, userName]);

  const handleCancel = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div className="PaymentPage-container">
      <h1>Paystack Payment Integration</h1>
      <form className="PaymentPage-form">
        <div>
          <label>Full Name:</label>
          <input type="text" value={name} onChange={handleNameChange} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={handleEmailChange} required />
        </div>
      </form>
      <div className="PaymentPage-button-container">
        <button className="PaymentPage-cancel-button" onClick={handleCancel}>
          Cancel
        </button>
        <PaystackPayment email={email} amount={amount} name={name} song={song} license={license} uid={uid} />
      </div>
    </div>
  );
};

export default PaymentPage;

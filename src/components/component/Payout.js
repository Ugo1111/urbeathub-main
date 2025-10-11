import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Helmet } from 'react-helmet-async';

function Payout() {
  const [formData, setFormData] = useState({
    fullName: "",
    bankName: "",
    accountNumber: "",
  });

  const [error, setError] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [showInput, setShowInput] = useState(false);

  // Fetch existing accounts on load
  useEffect(() => {
    const fetchAccounts = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "beatHubUsers", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setAccounts(userData.accounts || []);
        }
      }
    };

    fetchAccounts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.bankName || !formData.accountNumber) {
      setError("All fields are required.");
      return;
    }

    if (!/^\d+$/.test(formData.accountNumber)) {
      setError("Account number must contain only numbers.");
      return;
    }

    setError("");
    const user = auth.currentUser;

    if (user) {
      const userDocRef = doc(db, "beatHubUsers", user.uid);
      const newAccounts = [...accounts, formData];

      if (newAccounts.length > 2) {
        setError("You can only add up to 2 accounts.");
        return;
      }

      await setDoc(userDocRef, { accounts: newAccounts }, { merge: true });

      setAccounts(newAccounts);
      setFormData({ fullName: "", bankName: "", accountNumber: "" });
      setShowInput(false);
    }
  };

  const handleDelete = async (index) => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "beatHubUsers", user.uid);
      const updatedAccounts = accounts.filter((_, i) => i !== index);

      await setDoc(userDocRef, { accounts: updatedAccounts }, { merge: true });

      setAccounts(updatedAccounts);
    }
  };

  return ( 
    <>
  <Helmet>
    <title>Payout Page</title>
  </Helmet>
  <div className="payout-body">
    <div className="payout-container">
      <h2 className="payout-title">Enter Payment Info</h2>

      {error && <p className="payout-error-message">{error}</p>}

      {/* Display Existing Accounts */}
      {accounts.length > 0 ? (
        <div className="payout-accounts">
          <h3>Saved Bank Accounts</h3>
          <ul>
            {accounts.map((acc, index) => (
              <li key={index}>
                {acc.fullName} - {acc.bankName} - {acc.accountNumber}
                <button
                  className="payout-button-delete"
                  onClick={() => handleDelete(index)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="payout-no-account">No bank accounts added yet.</p>
      )}

      {/* Add Account Button (Hidden when max is reached) */}
      {accounts.length < 2 && !showInput && (
        <button
          className="payout-button payout-button-primary"
          onClick={() => setShowInput(true)}
        >
          + Add Bank Account
        </button>
      )}

      {/* Form for Adding Account */}
      {showInput && accounts.length < 2 && (
        <form className="payout-form" onSubmit={handleSubmit}>
          <div className="payout-form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="payout-form-group">
            <label>Bank Name</label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="Enter your bank name"
              required
            />
          </div>

          <div className="payout-form-group">
            <label>Account Number</label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="Enter your account number"
              required
            />
          </div>

          <button type="submit" className="payout-button payout-button-primary">
            Save Account
          </button>
        </form>
      )}
    </div></div>
    </>
  );
}

export default Payout;
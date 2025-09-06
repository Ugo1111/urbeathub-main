import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../css/addToCart.css";
import GroupA from "../component/header.js";
import PaystackPayment from "../component/PaystackPayment";
import { useUpgradePrice } from "../component/UpgradePrice.js";
import djImage from '../../images/dj.jpg';
import StripeWrapper from "../component/StripeWrapper";
import { Helmet } from "react-helmet-async";
import { getExchangeRate } from "../utils/exchangeRate";
import { useUserLocation } from "../utils/useUserLocation";

function CheckoutPage() {
  const userCountry = useUserLocation(); 
  const [exchangeRate, setExchangeRate] = useState(null);

  const location = useLocation();
  const { item, selectedSong, selectedLicense } = location.state || {};
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  const { upgradePrice } = useUpgradePrice({
    email: userEmail,
    uid: user?.uid,
    cart,
    selectedLicense,
  });

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    if (userCountry === "GB") {
      async function fetchRate() {
        try {
          const rate = await getExchangeRate();
          setExchangeRate(rate);
        } catch {
          setExchangeRate(null);
        }
      }
      fetchRate();
    }
  }, [userCountry]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) setUserEmail(currentUser.email);
      if (!currentUser || item) {
        setCart(item ? [item] : []);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "beatHubUsers", currentUser.uid);
        const userSnap = await getDoc(userRef);
        setCart(userSnap.exists() ? userSnap.data().cart || [] : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [item]);

  const parsePrice = (price) => {
    if (!price) return 0;
    const num = parseFloat(price.toString().replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const formatPrice = (usdAmount) => {
    if (!usdAmount) usdAmount = 0;
    if (userCountry === "GB" && exchangeRate) {
      return `₦${Math.round(usdAmount * exchangeRate).toLocaleString()}`;
    }
    return `$${usdAmount.toFixed(2)}`;
  };

  const totalPrice = parsePrice(selectedLicense?.price);

  console.log("Current cart state:", cart);
  // ✅ Build lean cart and log it
  const leanCart = cart.map(item => {
    // Map selectedLicense to the key in monetization
    const licenseKey = (selectedLicense?.name ).toLowerCase().replace(" license", "");
    
    // Get price for that license
    const price = item.monetization[licenseKey]?.price ;
  
    return {
      beatId: item.id,
      license: selectedLicense?.name ,
      price,
    };
  });

  console.log("Lean cart ready for Paystack:", leanCart);

  return (
    <div>
      <Helmet>
        <title>Payment | Cart Checkout</title>
      </Helmet>
      <div className="CheckoutContainer">
        <GroupA />
        <h1 className="CheckoutTitle">Checkout</h1>
        <div className="CheckoutBody">
          <div className="checkoutItem">
            {loading ? <p>Loading cart...</p> :
              cart.length === 0 ? <p>Your cart is empty.</p> :
              cart.map((song, i) => (
                <div key={i} className="cart-list-item">
                  <div className="cart-list-info">
                    <img src={selectedSong.coverUrl || djImage} className="cart-list-image" alt="Song Cover" />
                    <div className="cart-list-item-title-license">
                      <div className="cart-list-item-title">{selectedSong.title || "Unknown Title"}</div>
                      <div className="cart-list-item-license">{selectedLicense?.name || "Unknown License"}</div>
                    </div>
                  </div>
                  <div className="cart-list-actions">
                    <div className="cart-list-price">{formatPrice(parsePrice(selectedLicense?.price))}</div>
                  </div>
                </div>
              ))
            }
          </div>

          <div className="CartSection2">
            <div className="CartSummary">
              <h2>Cart Summary</h2>
              {cart.map((song, i) => (
                <div key={i} className="selectedCartSummary">
                  <div className="certSummarySong">{selectedSong?.title || "Untitled Song"}</div>
                  <div className="certSummaryPRICE">{formatPrice(parsePrice(selectedLicense?.price))}</div>
                </div>
              ))}

              {location.state?.isUpgrade && location.state?.ownedLicensePrice !== undefined && (
                <div className="UpgradeDeduction">
                  <div>Upgrade deduction</div>
                  <div>- {formatPrice(parsePrice(location.state.ownedLicensePrice))}</div>
                </div>
              )}

              <div className="Total_CartSummary">
                <hr />
                <h3>Total ({cart.length} item{cart.length !== 1 ? "s" : ""})</h3>
                <h3>{upgradePrice !== null ? formatPrice(upgradePrice) : formatPrice(totalPrice)}</h3>
              </div>

              {userEmail ? (
                <>
                  {userCountry === "GB" ? (
                    <PaystackPayment
                      email={userEmail}
                      amount={upgradePrice !== null ? upgradePrice : totalPrice}
                      song={selectedSong?.title}
                      beatId={selectedSong?.id}
                      license={selectedLicense?.name}
                      uid={user?.uid}
                      cart={leanCart} // ✅ Pass lean cart to Paystack
                    />
                  ) : (
                    <StripeWrapper
                      amount={upgradePrice !== null ? upgradePrice : totalPrice}
                      email={userEmail}
                      onSuccess={() => alert("Payment Successful!")}
                      license={selectedLicense?.name}
                      song={selectedSong?.title}
                      uid={user?.uid}
                      beatId={selectedSong?.id}
                    />
                  )}
                </>
              ) : (
                <Link
                  to="/CheckoutpaymentPage"
                  state={{ totalPrice, userEmail, song: selectedSong?.title, license: selectedLicense?.name, beatId: selectedSong?.id }}
                />
              )}

              <div>
                You are checking out {userEmail ? `with email: ${userEmail}` : "as a Guest"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
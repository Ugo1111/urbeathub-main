import React, { useEffect } from 'react';
import ReactGA from 'react-ga4';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";  
import HomePage from "./components/pages/HomePage";
import { ProfileSettingPage } from './components/pages/profileSettingPage'; // Updated import
import AddToCart from "./components/pages/addToCart";
import Passage from "./components/pages/loginPage";
import Enroll from "./components/pages/SignUpPage";
import CheckoutPage from "./components/pages/checkoutPage";
import AdminDashboard from './components/pages/AdminDashboard';
import FavouritePage from "./components/pages/FavouritePage";
import PurchasedTracksPage from "./components/pages/purchasedPage";
import CartPage from "./components/pages/CartPage";
import SellBeatPage from "./components/pages/sellBeatPage";
import UploadedbeatsPage from "./components/pages/UploadedbeatsPage";
import TabPage from "./components/component/tabs";
import ViewEditSellBeatPage from "./components/pages/ViewEditSellBeatPage";
import PaymentPage from "./components/pages/paymentPage";
import CheckoutpaymentPage from "./components/pages/checkoutpaymentPage";
import NegotiatePage from "./components/pages/NegotiatePage";
import SerachedBeatsList from "./components/component/searchComponent";
import PageOne from './components/pages/PageOne';
import PageTwo from './components/pages/PageTwo';
import EditTrackPage from './components/pages/EditTrackPage';
import UsersUploadMusicPage from "./components/component/UsersUploadMusicPage";
import { MusicUploadProvider } from "./components/context/MusicUploadProvider";
import "./App.css";
import Privacy from "./components/pages/privacy";
import Termsandcondition from "./components/pages/Termsandcondition";
import Licensedetails from "./components/pages/Licensedetails";
import Startsellingpage from "./components/pages/startsellingpage";
import Refundpolicy from "./components/pages/Refundpolicy";
import CookieConsent from "react-cookie-consent";
import ForgotPassword from "./components/ForgotPassword"; 
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import UserProfilePage from "./components/pages/UserProfilePage"; // Import UserProfilePage

// Initialize Google Analytics
ReactGA.initialize('G-8Q9JH9G3KH');

// Helper function to track custom events
export function trackEvent({ category, action, label }) {
  ReactGA.event({
    category,
    action,
    label,
  });
}

// Define the App component
function App() {
  useEffect(() => {
  const hasNotified = sessionStorage.getItem("visitorNotified");

  if (!hasNotified) {
    const sendVisitorInfo = async () => {
      try {
        const locationRes = await axios.get("https://ipapi.co/json/");
        const { city, country_name: country, ip } = locationRes.data;

        await axios.post("https://urbeathub-server.onrender.com/notify-telegram", {
          browser: navigator.userAgent,
          ip,
          city,
          country,
        });

        sessionStorage.setItem("visitorNotified", "true");
        console.log("✅ Visitor notification sent once per session.");
      } catch (error) {
        console.error("❌ Error sending visitor info:", error.message);
      }
    };

    sendVisitorInfo();
  }
}, []);


  return (
    <Router>
      <RouteTracker />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/addToCart" element={<AddToCart />} />
        <Route path="/loginPage" element={<Passage />} />
        <Route path="/signUpPage" element={<Enroll />} />
        <Route path="/checkoutPage" element={<CheckoutPage />} />
        <Route path="/profileSettingPage" element={<ProfileSettingPage />} /> {/* Updated route */}
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/FavouritePage" element={<FavouritePage />} />
        <Route path="/purchasedPage" element={<PurchasedTracksPage />} />
        <Route path="/CartPage" element={<CartPage />} />
        <Route path="/UploadedbeatsPage" element={<UploadedbeatsPage />} />
        <Route path="/searchComponent" element={<SerachedBeatsList />} />
        <Route path="/NegotiatePage" element={<NegotiatePage />} />
        <Route path="/SellBeatPage/*" element={
          <MusicUploadProvider>
            <SellBeatPage />
          </MusicUploadProvider>
        } />
        <Route path="/ViewEditSellBeatPage" element={<ViewEditSellBeatPage />} />
        <Route path="/paymentPage" element={<PaymentPage />} />
        <Route path="/checkoutpaymentPage" element={<CheckoutpaymentPage />} />
        <Route path="/PageOne" element={<PageOne />} />
        <Route path="/PageTwo" element={<PageTwo />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/Licensedetails" element={<Licensedetails />} />
        <Route path="/termsandcondition" element={<Termsandcondition />} />
        <Route path="/startsellingpage" element={<Startsellingpage />} />
        <Route path="/Refundpolicy" element={<Refundpolicy />} />
        <Route path="/EditTrackPage" element={<EditTrackPage />} />
        <Route path="/usersUploadMusicPage" element={
          <MusicUploadProvider>
            <UsersUploadMusicPage />
          </MusicUploadProvider>
        } />
        <Route path="/tabs" element={
          <MusicUploadProvider>
            <TabPage />
          </MusicUploadProvider>
        } />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/profile/:userId" element={<UserProfilePage />} /> {/* Add route for UserProfilePage */}
      </Routes>

      <CookieConsent
        location="bottom"
        buttonText="Accept"
        cookieName="myAwesomeCookieName2"
        style={{ background: "#000000" }}
        buttonStyle={{ background: "#db3056", color: "#ffffff", fontSize: "13px" }}
        expires={30}
        declineButtonStyle={{ background: "#ffffff", color: "#db3056", fontSize: "13px" }}
        declineButtonText="Decline"
        enableDeclineButton={true}
        setDeclineCookie={true}
        onDecline={() => {}}
      >
        This website uses cookies to enhance the user experience. see our <a href="/privacy" style={{ color: "#db3056", textDecoration: "none" }}>privacy policy</a> to learn more.
      </CookieConsent>
      <ToastContainer />

    </Router>
  );
}

// Component for tracking page views
function RouteTracker() {
  const location = useLocation();
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);

  return null;
}

export default App;

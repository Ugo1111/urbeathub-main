import React, { useEffect } from 'react';
import ReactGA from 'react-ga4';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";  // Ensure Router is imported correctly
import HomePage from "./components/pages/HomePage";
import { ProfilePage } from './components/pages/profilePage';
import AddToCart from "./components/pages/addToCart";
import Passage from "./components/pages/loginPage";
import Enroll from "./components/pages/SignUpPage";
import CheckoutPage from "./components/pages/checkoutPage";
import AdminDashboard from './components/pages/AdminDashboard';
import FavouritePage from './components/pages/FavouritePage';
import PurchasedTracksPage from './components/pages/purchasedPage';
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
import Licensedetails from "./components/pages/Licensedetails";
import CookieConsent from "react-cookie-consent";


// Initialize Google Analytics
ReactGA.initialize('G-8Q9JH9G3KH');

// Define the App component
function App() {
  return (
    <Router>
      <RouteTracker />  {/* Add RouteTracker component to handle page views */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/addToCart" element={<AddToCart />} />
        <Route path="/loginPage" element={<Passage />} />
        <Route path="/signUpPage" element={<Enroll />} />
        <Route path="/checkoutPage" element={<CheckoutPage />} />
        <Route path="/profilePage" element={<ProfilePage />} />
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
      </Routes>
      <CookieConsent
        debug={true}
        location="bottom"
        buttonText="Accept"
        cookieName="myAwesomeCookieName2"
        style={{ background: "#000000" }}
        buttonStyle={{background:" #db3056", color: "#ffffff", fontSize: "13px" }}
        expires={30}
        declineButtonStyle={{ background: "#ffffff", color: "#db3056", fontSize: "13px", }} 
        declineButtonText="Decline"
        enableDeclineButton={true}
        setDeclineCookie={true} 
        onDecline={() => {}}
      >
        This website uses cookies to enhance the user experience. see our  <a href="/privacy" style={{ color: "#db3056", textDecoration: "none" }}>privacy policy</a> to learn more.
      </CookieConsent>
    </Router>
  );
}

// Component for tracking page views
function RouteTracker() {
  const location = useLocation();  // Now inside Router, this will work
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);

  return null;  
}

export default App;

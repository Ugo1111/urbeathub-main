import React, { useEffect } from 'react';
import ReactGA from 'react-ga4';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";  
import HomePage from "./components/pages/HomePage";
import { ProfilePage } from './components/pages/profilePage';
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
export function trackEvent({ eventName, songTitle, artist }) {
  ReactGA.event(eventName, {
    song_title: songTitle || "Unknown Track",
    artist: artist || "Unknown Artist",
  });
}

// Define the App component
function App() {
useEffect(() => {
    const hasNotified = sessionStorage.getItem("visitorNotified");
    const hasVisitedBefore = localStorage.getItem("hasVisitedBefore");

    if (!hasNotified) {
      const sendVisitorInfo = async () => {
        // Helper to check if referrer matches domains
        function matchesDomainList(ref, domains) {
          return domains.some(domain => ref.includes(domain));
        }

        // Simplified browser + device detection
        function getBrowserInfo() {
          const ua = navigator.userAgent;
          let browser = "Unknown";

          if (ua.includes("Chrome") && !ua.includes("Edg") && !ua.includes("OPR")) {
            browser = "Chrome";
          } else if (ua.includes("Firefox")) {
            browser = "Firefox";
          } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
            browser = "Safari";
          } else if (ua.includes("Edg")) {
            browser = "Edge";
          } else if (ua.includes("OPR") || ua.includes("Opera")) {
            browser = "Opera";
          }

          // Detect mobile or desktop based on user agent keywords
          const device = /Mobi|Android|iPhone|iPad/i.test(ua) ? "Mobile" : "Desktop";
          return `${browser} (${device})`;
        }

        try {
          // Fetch location info
          const locationRes = await axios.get("https://ipapi.co/json/");
          const { city, country_name: country, ip } = locationRes.data;

          // Referrer URL
          const referrer = document.referrer || "";

          // UTM params from URL
          const params = new URLSearchParams(window.location.search);
          const utm = {
            source: params.get("utm_source"),
            medium: params.get("utm_medium"),
            campaign: params.get("utm_campaign"),
          };

          // Known domains for social media & search engines
          const socialMediaSites = [
            "facebook.com", "twitter.com", "instagram.com", "linkedin.com",
            "t.co", "reddit.com", "pinterest.com", "tiktok.com"
          ];

          const searchEngines = [
            "google.", "bing.com", "yahoo.com", "duckduckgo.com", "baidu.com", "yandex.com"
          ];

          // Determine traffic source
          let trafficSource = "Direct";

          if (utm.source) {
            trafficSource = `UTM: ${utm.source}`;
          } else if (referrer) {
            if (matchesDomainList(referrer, socialMediaSites)) {
              trafficSource = "Social Media";
            } else if (matchesDomainList(referrer, searchEngines)) {
              trafficSource = "Search Engine";
            } else {
              trafficSource = `Referral: ${new URL(referrer).hostname}`;
            }
          }

          // Send visitor info to backend
          await axios.post("https://urbeathub-server.onrender.com/notify-telegram", {
            browser: getBrowserInfo(),
            ip,
            city,
            country,
            isReturning: !!hasVisitedBefore,
            trafficSource,
            utm,
          });

          localStorage.setItem("hasVisitedBefore", "true");
          sessionStorage.setItem("visitorNotified", "true");

          console.log(hasVisitedBefore ? "🔁 Returning visitor" : "🆕 New visitor");
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

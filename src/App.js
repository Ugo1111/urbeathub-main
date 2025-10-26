import React, { useEffect } from 'react';
import ReactGA from 'react-ga4';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";  
import HomePage from "./components/pages/HomePage";
import CoverArt from "./components/pages/CoverArt";
import { ProfileSettingPage } from './components/pages/profileSettingPage'; // Updated import
import AddToCart from "./components/pages/addToCart";
import Passage from "./components/pages/loginPage";
import Enroll from "./components/pages/SignUpPage";
import CheckoutPage from "./components/pages/checkoutPage";
import AdminDashboard from './components/pages/AdminDashboard';
import FavouritePage from "./components/pages/FavouritePage";
import PurchasedTracksPage from "./components/pages/purchasedPage";
import CartPage from "./components/pages/CartPage";
//import SellBeatPage from "./components/pages/sellBeatPage";
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
import Front from "./components/pages/Front"; // Import Front component
import Startsellingpage from "./components/pages/startsellingpage";
import Refundpolicy from "./components/pages/Refundpolicy";
import MusicDistributionForm from "./components/pages/MusicDistributionForm.js";
import CookieConsent from "react-cookie-consent";
import ForgotPassword from "./components/ForgotPassword"; 
import CoverArtShowcase from './components/component/CoverArtShowcase.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import UserProfilePage from "./components/pages/UserProfilePage"; // Import UserProfilePage
import ProducersStore from "./components/pages/store.js"; // Import UserProfilePage
import PostPage from "./components/pages/PostPage"; // Import PostPage component
import ViewPostPage from "./components/pages/ViewPostPage"; // Import ViewPostPage
import PostTimelinePage from "./components/pages/PostTimelinePage"; // Import PostTimelinePage
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import useActivityLogger from "./hooks/useActivityLogger";
import Dashboard from './components/pages/Dashboard.js';
import Tracks from './components/pages/Tracks.js';
import ImageEditor from './components/pages/ImageEditor.js';
import Blog from './components/pages/Blog.js';
import BlogPost from './components/pages/BlogPost.js';
import ErrorBoundary from "./components/ErrorBoundary";
import { logErrorToTelegram } from "./components/utils/errorLogger";

// Capture global JS errors
window.onerror = (msg, url, lineNo, columnNo, error) => {
  logErrorToTelegram(error || msg, "Window Error");
  return false;
};

// Capture unhandled promise rejections
window.onunhandledrejection = (event) => {
  logErrorToTelegram(event.reason, "Unhandled Promise Rejection");
};


// Initialize Google Analytics
ReactGA.initialize('G-8Q9JH9G3KH');

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC);

// Helper function to track custom events
export function trackEvent({ eventName, songTitle, artist }) {
  ReactGA.event(eventName, {
    song_title: songTitle || "Unknown Track",
    artist: artist || "Unknown Artist",
  });
}

// Add this component inside App.js

function PaymentRedirectHandler() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const redirectStatus = params.get("redirect_status");

    if (redirectStatus === "succeeded") {
      // ✅ Clear guest cart from localStorage
      localStorage.removeItem("cart");

      toast.success("✅ Payment successful! Check your email for your beats 🎶");
    } else if (redirectStatus === "failed") {
      toast.error("❌ Payment failed. Please try again.");
    }
  }, [location]);

  return null; // nothing to render, just effect
}

// Define the App component
function App() {
  useActivityLogger(); // Start tracking



  return (
    <Router>
      <RouteTracker />
      <PaymentRedirectHandler /> 
      <Elements stripe={stripePromise}>
        <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Front />} />
          <Route path="/homePage" element={<HomePage />} />
          <Route path="/addToCart/:slug" element={<AddToCart />} />
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

          {/*<Route path="/SellBeatPage/*" element={
            <MusicUploadProvider>
              <SellBeatPage />
            </MusicUploadProvider>
          } />*/}
         
<Route path="/Dashboard" element={
          <MusicUploadProvider>
            <Dashboard />
          </MusicUploadProvider>
        } />

          <Route path="/ViewEditSellBeatPage" element={<ViewEditSellBeatPage />} />
          <Route path="/paymentPage" element={<PaymentPage />} />
          <Route path="/checkoutpaymentPage" element={<CheckoutpaymentPage />} />
          <Route path="/PageOne" element={<PageOne />} />
          <Route path="/PageTwo" element={<PageTwo />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/Licensedetails" element={<Licensedetails />} />
          <Route path="/coverart" element={<CoverArt />} />
             <Route path="/coverartshowcase" element={<CoverArtShowcase />} />
             <Route path="/ImageEditor" element={<ImageEditor />} />
          <Route path="/musicDistributionForm" element={<MusicDistributionForm />} />
          <Route path="/termsandcondition" element={<Termsandcondition />} />
          <Route path="/startsellingpage" element={<Startsellingpage />} />
          <Route path="/Refundpolicy" element={<Refundpolicy />} />
          <Route path="/Tracks" element={<Tracks />} />
          <Route path="/EditTrackPage" element={<EditTrackPage />} />
          <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />

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
          <Route path="/store/:userId" element={<ProducersStore />} /> {/* Add route for UserProfilePage */}
          <Route path="/post/:postId" element={<PostPage />} /> {/* Add route for PostPage */}
          <Route path="/view-post/:postId" element={<ViewPostPage />} /> {/* Ensure ViewPostPage route */}
          <Route path="/post-timeline" element={<PostTimelinePage />} /> {/* Ensure PostTimelinePage route */}
        </Routes>
        </ErrorBoundary>
      </Elements>

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


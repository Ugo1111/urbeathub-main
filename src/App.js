import HomePage from "./components/pages/HomePage";
import { ProfilePage } from './components/pages/profilePage'; // Import ProfilePage correctly
import AddToCart from "./components/pages/addToCart";
import Passage from "./components/pages/loginPage";
import Enroll from "./components/pages/SignUpPage";
import CheckoutPage from "./components/pages/checkoutPage";
import AdminDashboard from './components/pages/AdminDashboard'; // Import AdminDashboard
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
import EditTrackPage from './components/pages/EditTrackPage'; // Import EditTrackPage
import UsersUploadMusicPage from "./components/component/UsersUploadMusicPage"; // Import UsersUploadMusicPage
import { MusicUploadProvider } from "./components/context/MusicUploadProvider"; // Import the provider
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// This is where the main app is...
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/addToCart" element={<AddToCart />} />
        <Route path="/loginPage" element={<Passage />} />
        <Route path="/signUpPage" element={<Enroll />} />
        <Route path="/checkoutPage" element={<CheckoutPage />} />
        <Route path="/profilePage" element={<ProfilePage />} />
        <Route path="/admin/*" element={<AdminDashboard />} /> {/* Update to use AdminDashboard */}
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
        } /> {/* Wrap SellBeatPage with MusicUploadProvider */}
        <Route path="/ViewEditSellBeatPage" element={<ViewEditSellBeatPage />} />
        <Route path="/paymentPage" element={<PaymentPage />} />
        <Route path="/checkoutpaymentPage" element={<CheckoutpaymentPage />} />
        <Route path="/PageOne" element={<PageOne />} />
        <Route path="/PageTwo" element={<PageTwo />} />
        <Route path="/EditTrackPage" element={<EditTrackPage />} /> {/* Add route for EditTrackPage */}
        <Route path="/usersUploadMusicPage" element={
          <MusicUploadProvider>
            <UsersUploadMusicPage />
          </MusicUploadProvider>
        } /> {/* Wrap UsersUploadMusicPage with MusicUploadProvider */}
        {/* Wrap TabPage with MusicUploadProvider */}
        <Route path="/tabs" element={
          <MusicUploadProvider>
            <TabPage />
          </MusicUploadProvider>
        } />
      </Routes>
    </Router>
  );
}

export default App;
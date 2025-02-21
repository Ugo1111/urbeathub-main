import HomePage from "./components/pages/HomePage";
import ProfilePage from "./components/pages/profilePage";
import AddToCart from "./components/pages/addToCart";
import Passage from "./components/pages/loginPage";
import Enroll from "./components/pages/SignUpPage";
// import CheckoutPage from "./components/pages/checkoutPage";
import UploadMusicPage from './components/pages/UploadMusicPage';
import FavouritePage from './components/pages/FavouritePage';
import Purchased from './components/pages/purchasedPage';
import CartPage from "./components/pages/CartPage";
import TabPage from "./components/pages/tabs";
import SerachedBeatsList from "./components/component/searchComponent";



import { MusicUploadProvider } from "./components/context/MusicUploadProvider"; // Import the provider

import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// This is where the main app is...
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/buysong" element={<AddToCart />} />
        <Route path="/loginPage" element={<Passage />} />
        <Route path="/signUpPage" element={<Enroll />} />
        {/* <Route path="/checkoutPage" element={<CheckoutPage />} /> */}
        <Route path="/profilePage" element={<ProfilePage />} />
        <Route path="/UploadMusicPage" element={<UploadMusicPage />} />
        <Route path="/FavouritePage" element={<FavouritePage />} />
        <Route path="/purchasedPage" element={<Purchased />} />
        <Route path="/CartPage" element={<CartPage />} />
        <Route path="/searchComponent" element={<SerachedBeatsList />} />
      

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
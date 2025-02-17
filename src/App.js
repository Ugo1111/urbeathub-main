
import HomePage from "./components/pages/HomePage";
import ProfilePage from "./components/pages/profilePage";
import AddToCart from "./components/pages/addToCart";
import Passage from "./components/pages/loginPage";
import Enroll from "./components/pages/SignUpPage";
import CheckOut from "./components/pages/checkout";
import UploadMusicPage from './components/pages/UploadMusicPage';
import FavouritePage from './components/pages/FavouritePage';
import CartPage from "./components/pages/CartPage";

import "./App.css";
import {BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate} from "react-router-dom";

//This is where the main app is...
function App() {
  return (
          <Router>
          <Routes>
            <Route path="/" element={<HomePage/>}  />
            <Route path="/buysong" element={<AddToCart/>} />
            <Route path="/loginPage" element={<Passage/>} />
            <Route path="/signUpPage" element={<Enroll/>} />
            <Route path="/checkout" element={<CheckOut/>} />
            <Route path="/profilePage" element={<ProfilePage/>} />
            <Route path="/UploadMusicPage" element={<UploadMusicPage/>} />
            <Route path="/FavouritePage" element={<FavouritePage/>} />
            <Route path="/CartPage" element={<CartPage/>} />
           
          </Routes>
          </Router>
  )
}

export default App;
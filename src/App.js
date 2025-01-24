
import HomePage from "./components/pages/HomePage";
import AddToCart from "./components/pages/addToCart";
import Passage from "./components/pages/loginPage";
import Enroll from "./components/pages/SignUpPage";
import CheckOut from "./components/pages/checkout";
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
          </Routes>
          </Router>
  )
}

export default App;

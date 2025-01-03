
import HomePage from "./components/pages/HomePage";
import AddToCart from "./components/pages/addToCart";
import "./App.css";
import {BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate} from "react-router-dom";



//This is where the main app is...
function App() {
  return (
          <Router>
          <Routes>
            <Route path="/" element={<HomePage/>}  />
            <Route path="/buysong" element={<AddToCart/>} />
          </Routes>
          </Router>
  )
}

export default App;

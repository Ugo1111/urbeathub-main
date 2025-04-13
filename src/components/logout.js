import React from "react";
import { logout } from "../firebase/authFunctions";

const Logout = () => {
  const handleLogout = () => {
    logout()
      .then(() => {
        // alert("Successfully logged out!");
      })
      .catch((error) => {
        console.error("Logout Error:", error.message);
      });
  };

  return (
    <div>
     
      <button onClick={handleLogout} style={{ color: "white", fontSize: "0.9rem", backgroundColor: "transparent", }}>Logout</button>
      
    </div>
  );
};

export default Logout;
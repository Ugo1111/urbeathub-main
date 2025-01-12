import React, { useState, useEffect } from "react";
import "../css/component.css";
import AuthState from "../AuthState";
import Logout from "../logout";
import { IoIosContact } from "react-icons/io";

export default function Profile({ user }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="dropdown">
      <button onClick={toggleDropdown} className="dropbtn">
       <p>  <IoIosContact /></p>
      </button>
      {isDropdownOpen && (
        <div id="myDropdown" className="dropdown-content">
          <a href="#home" className="userEmail" ><IoIosContact /> {user.email}</a><hr></hr>
          <a href="#home">Favourite</a>
          <a href="#about">Purchased</a>
          <a href="#about">Chart</a>
          <div><Logout /></div>
        </div>
      )}
    </div>
  );
}

{/*   */}
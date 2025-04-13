import React, { useState, useEffect } from "react";
import "../css/component.css";
import { FaCartShopping } from "react-icons/fa6";
import { FaShareAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { SlOptionsVertical } from "react-icons/sl"; 
import Download from "../component/download.js";

export default function MoreOptions({ song, openShareModal }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Toggle dropdown visibility
    const toggleDropdown = (event) => {
        event.stopPropagation(); // Prevent triggering play on click
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
                <SlOptionsVertical size="1.5em" />
            </button>
            {isDropdownOpen && (
                <div id="myDropdown" className="dropdown-content">
                    <Link to="/buysong" state={{ song }}>
                     {/*   <button><FaCartShopping size="1.5em" /> Buy</button>*/}
                    </Link>

                    <Download song={song} />

                   {/* <button onClick={(event) => {
                        event.stopPropagation();
                        openShareModal(song, event);
                    }}>
                       <FaShareAlt size="1.5em" /> Share
                    </button>  */}
                </div>
            )}
        </div>
    );
}

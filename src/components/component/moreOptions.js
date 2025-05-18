import React, { useState, useEffect } from "react";
import "../css/component.css";
import { FaCartShopping } from "react-icons/fa6";
import { FaShareAlt } from "react-icons/fa";
import { SlOptionsVertical } from "react-icons/sl"; 
import { getFirestore, doc, getDoc } from "firebase/firestore";
import Download from "../component/download.js";

export default function MoreOptions({ song, openShareModal }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isDownloadEnabled, setIsDownloadEnabled] = useState(false);
    const db = getFirestore();

    useEffect(() => {
        const fetchMonetizationData = async () => {
            if (!song?.id) return;

            try {
                const songDocRef = doc(db, `beats/${song.id}`);
                const songDocSnap = await getDoc(songDocRef);

                if (songDocSnap.exists()) {
                    const monetization = songDocSnap.data().monetization;
                    setIsDownloadEnabled(monetization?.free?.enabled === true);
                }
            } catch (error) {
                console.error("Error fetching monetization data:", error);
            }
        };

        fetchMonetizationData();
    }, [song?.id, db]);

    const toggleDropdown = (event) => {
        event.stopPropagation();
        setIsDropdownOpen((prev) => !prev);
    };

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
                <SlOptionsVertical size="1em" />     
            </button>
            {isDropdownOpen && (
                <div id="myDropdown" className="dropdown-content">
                    {isDownloadEnabled && <Download song={song} />}
                </div>
            )}
        </div>
    );
}

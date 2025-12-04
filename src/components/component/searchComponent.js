import { auth, db } from "../../firebase/firebase"; // Ensure Firestore is initialized in firebase.js
import React, { useState, useEffect } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import "../css/addToCart.css";
import djImage from '../../images/dj.jpg';
import { createSlug } from "../utils/slugify";
import { FaSearch } from "react-icons/fa";

const BeatsList = ({ className = "search-beats-body" }) => {
    const [beats, setBeats] = useState([]);
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        // Function to fetch beats from Firestore
        const fetchBeats = async () => {
            try {
                const q = query(collection(db, "beats"));
                const querySnapshot = await getDocs(q);
                const beatsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setBeats(beatsData);
            } catch (error) {
                console.error("Error fetching beats: ", error);
            }
        };

        fetchBeats();
    }, []);

    const handleClearInput = () => {
        setSearchText("");
    };

    // Filter beats based on search text, including tags in metadata
    const filteredBeats = beats.filter(beat => {
        const lowercasedSearchText = searchText.toLowerCase();
        const { title, metadata } = beat;
        const tagsString = metadata?.tags?.join(", ").toLowerCase() || "";

        return (
            title.toLowerCase().includes(lowercasedSearchText) ||
            tagsString.includes(lowercasedSearchText)
        );
    });

    return (
        <div className={className}>
            <div className="search-input-container">
                <FaSearch className="search-icon" />
               <input
                className="search-beats-input"
                type="text"
                placeholder="What beat are you looking for?"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                {searchText && (
                    <button className="clear-button" onClick={handleClearInput}>
                        &times;
                    </button>
                )}
            </div>
            {searchText && (
                <div className="search-beats-results-container">                                             
                    <ul className="search-beats-ul">  
                        {filteredBeats.map(beat => (  
                            <li key={beat.id} className="search-beats-li">
                               <Link 
  to={`/addToCart/${createSlug(beat.title, beat.id)}`} 
  state={{ song: beat }} 
  className="search-beats-li"
  onClick={() => setSearchText("")} // Clear searchText when clicking
>
                                    <img src={beat.coverUrl || djImage} alt="Cover Art Preview" className="search-image" />
                                    <div className="search-beats-results-metadata">
                                        <h3 className="search-beats-title">{beat.title}</h3>
                                        <div class="search-beats-meta-row">
                                        <p className="search-beats-bpm">BPM: {beat.metadata?.bpm}</p>
                                        <div className="search-beats-tags-container">
                                            {beat.metadata?.tags?.map((tag, index) => (
                                                <span key={index} className="search-beats-taglist"> 
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                
            )}
        </div>
    );
};

export default BeatsList;

import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { FaCartShopping } from "react-icons/fa6";
import djImage from '../../images/dj.jpg';
import "../css/recomendationComponent.css";
import { useUserLocation } from "../utils/useUserLocation";
import { getExchangeRate } from "../utils/exchangeRate";
import { createSlug } from "../utils/slugify";

const shuffleArray = (array) => {
  let shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

export default function RecomendationComponent() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const userCountry = useUserLocation();
  const [exchangeRate, setExchangeRate] = useState(null);

  useEffect(() => {
    const fetchSongs = async () => {
      const docRef = collection(db, "beats");
      const querySnapshot = await getDocs(docRef);
      const songsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const songsWithLikes = await Promise.all(
        songsList.map(async (song) => {
          const likesRef = collection(db, `beats/${song.id}/likes`);
          const likesSnapshot = await getDocs(likesRef);
          return { ...song, likes: likesSnapshot.size };
        })
      );

      const sortedSongs = songsWithLikes.sort((a, b) => b.likes - a.likes);
      const shuffledSongs = shuffleArray(sortedSongs);

      setSongs(shuffledSongs.slice(0, 12));
      setLoading(false);
    };

    fetchSongs();
  }, []);

  // Get exchange rate if user is in Nigeria
  useEffect(() => {
    if (userCountry === "NG") {
      async function fetchRate() {
        try {
          const rate = await getExchangeRate();
          setExchangeRate(rate);
        } catch {
          setExchangeRate(null);
        }
      }
      fetchRate();
    }
  }, [userCountry]);

  const parsePrice = (price) => {
    if (!price) return 0;
    const num = parseFloat(price.toString().replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const formatPrice = (usdAmount) => {
    if (!usdAmount) usdAmount = 0;
    if (userCountry === "NG" && exchangeRate) {
      return `₦${Math.round(usdAmount * exchangeRate).toLocaleString()}`;
    }
    return `$${usdAmount.toFixed(2)}`;
  };

  const handleLinkClick = () => {
    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="recomendation-list-container">
      {loading ? (
        Array.from({ length: 12 }).map((_, index) => (
          <span key={index} className="recomendation-list skeleton">
            <div className="skeleton-image"></div>
            <div className="skeleton-title"></div>
            <div className="skeleton-tag"></div>
          </span>
        ))
      ) : (
        songs.slice(0, 7).map((song, index) => (
          <span key={index} className="recomendation-list">
          <Link to={`/addToCart/${createSlug(song.title, song.id)}`} state={{ song }}
              className="recomendation-"
              onClick={handleLinkClick}
            >
              <img
                src={song.coverUrl || djImage}
                className="recomendation-image"
                alt={song.title || "Untitled"}
              />
              <div className="recomendation-title">{song.title}</div>
              <div className="recomendation-tag">
                <button className="recomendation-AddToCart-button">
                  <FaCartShopping size="1em" />{" "}
                  {formatPrice(parsePrice(song.monetization?.basic?.price))}
                </button>
              </div>
            </Link>
          </span>
        ))
      )}
    </div>
  );
}
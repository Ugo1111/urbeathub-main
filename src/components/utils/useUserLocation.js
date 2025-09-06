// src/components/utils/useUserLocation.js
import { useState, useEffect } from "react";

export function useUserLocation() {
  const [country, setCountry] = useState(null);

  useEffect(() => {
    const cachedCountry = sessionStorage.getItem("userCountry");
    if (cachedCountry) {
      setCountry(cachedCountry);
      return;
    }

    async function fetchCountry() {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        setCountry(data.country_code);
        sessionStorage.setItem("userCountry", data.country_code);
      } catch (err) {
        console.error("Could not get user country:", err);
        setCountry(null);
      }
    }

    fetchCountry();
  }, []);

  return country;
}
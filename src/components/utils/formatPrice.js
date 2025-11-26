// src/utils/formatPrice.js

import { useUserLocation } from "./useUserLocation";
import { useState, useEffect } from "react";
import { getExchangeRate } from "./exchangeRate";

export function useFormatPrice() {
  const userCountry = useUserLocation();
  const [exchangeRate, setExchangeRate] = useState(null);

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

  function formatPrice(usdAmount) {
    if (!usdAmount) usdAmount = 0;
    if (userCountry === "NG" && exchangeRate) {
      return `₦${Math.round(usdAmount * exchangeRate).toLocaleString()}`;
    }
    return `$${usdAmount.toFixed(2)}`;
  }

  return formatPrice;
}
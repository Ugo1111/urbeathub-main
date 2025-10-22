import { useState, useEffect } from "react";

export function useUpgradePrice({ email, uid, cart, selectedLicense }) {
  const [upgradePrice, setUpgradePrice] = useState(null);
  const [itemizedCart, setItemizedCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!email || !uid || !cart?.length) {
      setUpgradePrice(null);
      setItemizedCart([]);
      return;
    }

    const requestBody = {
      email,
      uid,
      cart: cart.map(song => ({
        beatId: song.songId || song.id,
        license: selectedLicense?.name || song.license || "Basic License",
      })),
    };

    const fetchUpgradePrice = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          "https://us-central1-beathub-4e595.cloudfunctions.net/calculateUpgradePrice",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          }
        );

        const data = await response.json();

        if (response.ok && typeof data.finalAmount === "number") {
          setUpgradePrice(data.finalAmount);
          setItemizedCart(data.itemizedCart || []);
        } else {
          setError(data.error || "Failed to fetch upgrade price");
          setUpgradePrice(null);
          setItemizedCart([]);
        }
      } catch (err) {
        setError(err.message);
        setUpgradePrice(null);
        setItemizedCart([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUpgradePrice();
  }, [
    email,
    uid,
    JSON.stringify(cart.map(song => song.songId || song.id)),
    selectedLicense?.name
  ]);

  return { upgradePrice, itemizedCart, loading, error };
}
import { useState, useEffect } from "react";

export function useUpgradePrice({ email, uid, cart, selectedLicense }) {
  const [upgradePrice, setUpgradePrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If no email, UID, no cart, or no selected license → skip
    if (!email || !uid || !cart?.length || !selectedLicense?.name) {
      setUpgradePrice(null);
      return;
    }

    // Only run when every cart item has a songId or id
    const allHaveIds = cart.every(song => song.songId || song.id);
    if (!allHaveIds) {
      // Wait until monetization data has added IDs
      return;
    }

    const fetchUpgradePrice = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          "https://us-central1-beathub-4e595.cloudfunctions.net/calculateUpgradePrice", // ✅ use correct working URL
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              uid,
              cart: cart.map(song => ({
                beatId: song.songId || song.id,
                license: selectedLicense?.name || song.license || "Basic License",
              })),
            }),
          }
        );

        const data = await response.json();

        if (response.ok && typeof data.finalAmount === "number") {
          setUpgradePrice(data.finalAmount);
        } else {
          setError(data.error || "Failed to fetch upgrade price");
          setUpgradePrice(null);
        }
      } catch (err) {
        setError(err.message);
        setUpgradePrice(null);
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

  return { upgradePrice, loading, error };
}
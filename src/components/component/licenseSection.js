import React, { useMemo, useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp, FaDownload } from "react-icons/fa";
import "../css/addToCart.css";
import HandleAddToCart from "../component/AddToCartComponent.js";
import { Link } from "react-router-dom";
import { getFirestore, collection, getDocs, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useUpgradePrice } from "../component/UpgradePrice.js";

export default function LicensingSection({ song }) {
  const [toggleAccordion, setToggleAccordion] = useState("basic");
  const [accordionOpen, setAccordionOpen] = useState(true);
  const [purchasedLicenses, setPurchasedLicenses] = useState([]);
  const auth = getAuth();
  const db = getFirestore();

  const licenseTier = {
    "Basic License": 1,
    "Premium License": 2,
    "Unlimited License": 3,
    "Exclusive License": 4,
  };

  const getPriceValue = (priceStr) =>
    parseFloat(priceStr.replace("$", "")) || 0;

  const licenses = useMemo(
    () => ({
      basic: {
        enabled: song?.monetization?.basic?.enabled || false,
        name: "Basic License",
        price: song?.monetization?.basic?.price
          ? `$${song.monetization.basic.price}`
          : "$25.00",
        details: "MP3",
        usageTerms: [
          "Receive a High Quality MP3",
          "Use It Commercially",
          "Sell Up To 5,000 Copies",
          "Available For 10,000 Streams",
          "No YouTube Monetization",
          "Must Credit Ur BeatHub",
        ],
      },
      premium: {
        enabled: song?.monetization?.premium?.enabled || false,
        name: "Premium License",
        price: song?.monetization?.premium?.price
          ? `$${song.monetization.premium.price}`
          : "$35.00",
        details: "MP3, WAV",
        usageTerms: [
          "Receive HQ MP3 & WAV",
          "Use It Commercially",
          "Sell Up To 10,000 Copies",
          "Available For 50,000 Streams",
          "YouTube Monetization",
          "Must Credit Ur BeatHub",
        ],
      },
      wavStems: {
        enabled: song?.monetization?.wavStems?.enabled || false,
        name: "Wav stems",
        price: song?.monetization?.wavStems?.price
          ? `$${song.monetization.wavStems.price}`
          : "$50.00",
        details: "STEMS, MP3, WAV",
        usageTerms: [
          "Receive HQ MP3, WAV & Trackouts",
          "Use It Commercially",
          "Sell Up To 20,000 Copies",
          "Limited to 100,000 Streams",
          "YT Monetization + 1 Music Video",
          "Must Credit Ur BeatHub",
        ],
      },
      unlimited: {
        enabled: song?.monetization?.unlimited?.enabled || false,
        name: "Unlimited License",
        price: song?.monetization?.unlimited?.price
          ? `$${song.monetization.unlimited.price}`
          : "$85.00",
        details: "STEMS, MP3, WAV",
        usageTerms: [
          "Receive HQ MP3, WAV & Trackouts",
          "Use It Commercially",
          "Sell Up To 20,000 Copies",
          "Limited to 100,000 Streams",
          "YT Monetization + 1 Music Video",
          "Must Credit Ur BeatHub",
        ],
      },
      exclusive: {
        enabled: song?.monetization?.exclusive?.enabled || false,
        name: "Exclusive License",
        price: "Negotiate price",
        details: "STEMS, MP3, WAV",
        usageTerms: [
          "All rights transferred to you",
          "Unlimited sales, streams, monetization",
          "No credit required",
          "Beat is removed from store",
          "Best for artists wanting ownership",
        ],
      },
    }),
    [song?.monetization]
  );

  const isExclusiveLicense = toggleAccordion === "exclusive";

  useEffect(() => {
    const fetchPurchasedLicenses = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const purchasesRef = collection(
          db,
          `beatHubUsers/${user.uid}/purchases`
        );
        const purchasesSnapshot = await getDocs(purchasesRef);

        const ownedLicenses = [];
        for (const purchaseDoc of purchasesSnapshot.docs) {
          const purchaseData = purchaseDoc.data();
          const purchaseRef = purchaseData.ref;

          if (purchaseRef) {
            const purchaseSnap = await getDoc(purchaseRef);
            if (purchaseSnap.exists()) {
              const purchaseDetails = purchaseSnap.data();
              if (purchaseDetails.beatId === song.id) {
                ownedLicenses.push(purchaseDetails.license);
              }
            }
          }
        }

        setPurchasedLicenses(ownedLicenses);
      } catch (error) {
        console.error("Error fetching purchased licenses:", error);
      }
    };

    fetchPurchasedLicenses();
  }, [auth.currentUser, song.id]);

  // Ownership & upgrade checks
  const user = auth.currentUser;
  const selectedLicenseName = licenses[toggleAccordion]?.name;
  const selectedLicenseTier = licenseTier[selectedLicenseName] || 0;
  const ownedTier = Math.max(
    ...purchasedLicenses.map((l) => licenseTier[l] || 0),
    0
  );
  const ownedLicenseName = Object.keys(licenseTier).find(
    (key) => licenseTier[key] === ownedTier
  );
  const ownedLicensePrice = getPriceValue(
    Object.values(licenses).find((l) => l.name === ownedLicenseName)?.price ||
      "$0.00"
  );

  const isExactOrLowerOwned = selectedLicenseTier <= ownedTier;
  const isUpgrade =
    ownedTier > 0 &&
    selectedLicenseTier > ownedTier &&
    selectedLicenseName !== "Exclusive License"; // ❌ Never upgrade Exclusive

  const stableCart = useMemo(
    () => [
      {
        id: song.id,
        songId: song.id,
        license: licenses[toggleAccordion]?.name || "Basic License",
      },
    ],
    [song.id, licenses[toggleAccordion]?.name]
  );

  const stableSelectedLicense = useMemo(
    () => licenses[toggleAccordion],
    [toggleAccordion, licenses]
  );

  // ✅ Only call API when it's a valid upgrade (not Exclusive)
  const { upgradePrice, loading, error } = useUpgradePrice({
    email: user?.email || null,
    uid: user?.uid || null,
    cart: isUpgrade ? stableCart : [],
    selectedLicense: isUpgrade ? stableSelectedLicense : null,
  });

  return (
    <div className="licensing-container">
      <span className="licensing-header">
        <h2>Licensing</h2>
        <div className="checkout">
          <span>
            {selectedLicenseName === "Exclusive License" ? (
              "" // Hide price text for Exclusive
            ) : isExactOrLowerOwned ? (
              "Already Purchased"
            ) : isUpgrade ? (
              <>
                {loading ? (
                  "Calculating upgrade..."
                ) : error ? (
                  <span style={{ color: "red" }}>{error}</span>
                ) : (
                  <>
                    Upgrade: ${Number(upgradePrice).toFixed(2)}
                    <span
                      style={{
                        textDecoration: "line-through",
                        color: "gray",
                        marginLeft: "8px",
                      }}
                    >
                      {licenses[toggleAccordion]?.price}
                    </span>
                  </>
                )}
              </>
            ) : (
              `Total: ${licenses[toggleAccordion]?.price}`
            )}
          </span>

          {isExclusiveLicense ? (
            <Link
              to={{
                pathname: "/NegotiatePage",
                state: { song, licenses, toggleAccordion },
              }}
            >
              <button className="negotiate-price-btn">Negotiate price</button>
            </Link>
          ) : isExactOrLowerOwned ? (
            <a href={song.musicUrls?.mp3 || "#"} download>
              <button className="buy-now-btn">
                <FaDownload /> Download
              </button>
            </a>
          ) : (
            <>
              <HandleAddToCart
                song={song}
                selectedLicense={licenses[toggleAccordion]}
                isUpgrade={isUpgrade}
                upgradePrice={upgradePrice}
                ownedLicenseName={ownedLicenseName}
                ownedLicensePrice={ownedLicensePrice}
              />
              <Link
                to="/CheckoutPage"
                state={{
                  item: song,
                  selectedSong: song,
                  selectedLicense: licenses[toggleAccordion],
                  licenses,
                  toggleAccordion,
                  isUpgrade,
                  upgradePrice,
                  ownedLicenseName,
                  ownedLicensePrice,
                }}
              >
                <button className="buy-now-btn">
                  {isUpgrade ? "Upgrade" : "Buy now"}
                </button>
              </Link>
            </>
          )}
        </div>
      </span>

      <hr />

      <div className="licenses">
        {Object.entries(licenses)
          .filter(([_, license]) => license.enabled)
          .map(([key, license]) => (
            <div
              key={key}
              className={`license-card ${
                key === toggleAccordion ? "active" : ""
              }`}
              onClick={() => setToggleAccordion(key)}
            >
              <h3>{license.name}</h3>
              <p>{license.price}</p>
              <small>{license.details}</small>
            </div>
          ))}
      </div>

      <hr />
      <div className="usageTermHeader">
        <h3 className="usageTermHeaderh3">The terms</h3>
        <button onClick={() => setAccordionOpen(!accordionOpen)}>
          {accordionOpen ? (
            <FaChevronUp size="1.5em" />
          ) : (
            <FaChevronDown size="1.5em" />
          )}
        </button>
      </div>

      <div className={accordionOpen ? "accordionOpen" : "panel"}>
        <br />
        <span>{licenses[toggleAccordion]?.name}</span>
        <span> ({licenses[toggleAccordion]?.price})</span>
        <br />
        <br />
        <div className="usageTermSection">
          {licenses[toggleAccordion]?.usageTerms?.map((term, index) => (
            <div key={index} className="usageTermList">
              {term}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
import { useEffect } from "react";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

export default function useActivityLogger() {
  useEffect(() => {
    const BACKEND_URL = "https://urbeathub-server.onrender.com/notify-telegram";
    const activityLog = [];
    const startTime = Date.now();
    let logSent = false;
    let currentUser = null;

    const parseBrowserInfo = (userAgent) => {
      const isMobile = /Mobile|Android|iPhone/i.test(userAgent);
      let browser = "Unknown";
      if (/Edg/i.test(userAgent)) browser = "Edge";
      else if (/Chrome/i.test(userAgent)) browser = "Chrome";
      else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) browser = "Safari";
      else if (/Firefox/i.test(userAgent)) browser = "Firefox";
      return `${browser} (${isMobile ? "Mobile" : "Desktop"})`;
    };

    const classifyTrafficSource = (referrer) => {
      if (!referrer) return "Direct";

      const ref = referrer.toLowerCase();
      if (ref.includes("facebook.com") || ref.includes("instagram.com") || ref.includes("twitter.com") || ref.includes("tiktok.com")) {
        return "Social Media";
      }
      if (ref.includes("google.com") || ref.includes("bing.com") || ref.includes("yahoo.com") || ref.includes("duckduckgo.com")) {
        return "Search Engine";
      }
      return `Referral: ${referrer}`;
    };

    const addEvent = (event, details = {}) => {
      activityLog.push({ event, details, timestamp: new Date().toISOString() });
    };

    const sendLog = () => {
      if (logSent) return;
      logSent = true;

      const timeSpent = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
      addEvent("Page Exit", { timeSpent: `${timeSpent} minutes` });

      const payload = {
        event: "User Session Summary",
        details: { activities: activityLog },
      };

      try {
        fetch(BACKEND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        });
      } catch (err) {
        console.error("❌ Final log failed:", err.message);
      }
    };

    const trackVisitor = async () => {
      const hasNotified = sessionStorage.getItem("visitorNotified");
      const hasVisitedBefore = localStorage.getItem("hasVisitedBefore");
      if (hasNotified) return;

      try {
        const params = new URLSearchParams(window.location.search);
        const utm = {
          source: params.get("utm_source"),
          medium: params.get("utm_medium"),
          campaign: params.get("utm_campaign"),
        };

        const { data } = await axios.get("https://ipapi.co/json/");
        const { city, country_name: country, ip } = data;

        const rawReferrer = document.referrer || "";
        const classifiedSource = classifyTrafficSource(rawReferrer);

        await axios.post(BACKEND_URL, {
          browser: parseBrowserInfo(navigator.userAgent),
          ip,
          city,
          country,
          isReturning: !!hasVisitedBefore,
          isSignedIn: !!currentUser?.uid,
          trafficSource: classifiedSource,
          utm,
        });

        sessionStorage.setItem("visitorNotified", "true");
        localStorage.setItem("hasVisitedBefore", "true");

      } catch (err) {
        console.error("❌ Visitor tracking error:", err.message);
      }
    };

    const trackAudioEvents = () => {
      document.querySelectorAll("audio").forEach((audio) => {
        let playStart = null;
        const trackName = audio.closest("[data-title]")?.dataset.title || audio.src || "Unknown Track";

        audio.addEventListener("play", () => {
          playStart = Date.now();
          addEvent("Audio Play", { trackName });
        });

        const logAudioEnd = () => {
          if (playStart) {
            const playedFor = ((Date.now() - playStart) / 1000 / 60).toFixed(2);
            addEvent("Audio Pause/End", { trackName, playedFor: `${playedFor} minutes` });
            playStart = null;
          }
        };

        audio.addEventListener("pause", logAudioEnd);
        audio.addEventListener("ended", logAudioEnd);
      });
    };

    const handleClick = (e) => {
  const element = e.target.tagName;
  let text = e.target.innerText || e.target.alt || e.target.placeholder || e.target.name || "No Text";
  
  // For inputs, show their type or placeholder to make Telegram logs meaningful
  if (element === "INPUT" || element === "TEXTAREA") {
    text = e.target.placeholder || e.target.name || e.target.type || "Input Field";
  }

  addEvent("Click", { element, text, url: window.location.href });
};

    let unsubscribed = false;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (unsubscribed) return;

      const wasSignedOut = sessionStorage.getItem("signedOut") === "true";
      const wasSignedIn = !!currentUser?.uid;

      if (!user && wasSignedIn && currentUser?.uid) {
        sessionStorage.setItem("previousUserUid", currentUser.uid);
        sessionStorage.setItem("signedOut", "true");

        addEvent("Sign Out", {
          email: currentUser?.email || "Unknown",
          status: "User Logged Out",
        });

        try {
          await axios.post(BACKEND_URL, {
            event: "Sign Out",
            details: {
              email: currentUser?.email || "Unknown",
              status: "User Logged Out",
            },
          });
        } catch (err) {
          console.error("❌ Sign-out log failed:", err.message);
        }
      }

      currentUser = user;

      if (user && !wasSignedIn) {
        addEvent("Sign In", { email: user.email, status: "Signed In" });
        sessionStorage.setItem("previousUserUid", user.uid);
        sessionStorage.removeItem("signedOut");

        try {
          await axios.post(BACKEND_URL, {
            event: "Sign In",
            details: { email: user.email, status: "Signed In" },
          });
        } catch (err) {
          console.error("❌ Sign-in log failed:", err.message);
        }
      }

      trackVisitor();
    });

    document.addEventListener("click", handleClick);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") sendLog();
    });

    trackAudioEvents();

    window.addEventListener("beforeunload", sendLog);
    window.addEventListener("pagehide", sendLog);

    return () => {
      unsubscribed = true;
      unsubscribe();
      document.removeEventListener("click", handleClick);
      window.removeEventListener("beforeunload", sendLog);
      window.removeEventListener("pagehide", sendLog);
      document.removeEventListener("visibilitychange", sendLog);
    };
  }, []);
  
}

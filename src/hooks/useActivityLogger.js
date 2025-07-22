import { useEffect } from "react";

export default function useActivityLogger() {
  useEffect(() => {
    const BACKEND_URL = "http://localhost:3001/notify-telegram";
    const activityLog = [];
    const startTime = Date.now();
    let logSent = false;

    const addEvent = (event, details = {}) => {
      activityLog.push({
        event,
        details,
        timestamp: new Date().toISOString(),
      });
      console.log("📌 Event recorded:", event, details);
    };

    const sendLog = () => {
      if (logSent) return;
      logSent = true;

      const timeSpent = ((Date.now() - startTime) / 1000).toFixed(2);
      addEvent("Page Exit", { timeSpent: `${timeSpent} seconds` });

      const payload = {
        event: "User Session Summary",
        details: { activities: activityLog },
      };

      // Prefer sendBeacon for unload safety
      const beaconSent = navigator.sendBeacon?.(
        BACKEND_URL,
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );

      if (!beaconSent) {
        // Fallback to Axios
        import("axios").then(({ default: axios }) => {
          axios
            .post(BACKEND_URL, payload)
            .then(() => console.log("✅ Activity log sent"))
            .catch((err) => console.error("❌ Activity log failed:", err.message));
        });
      }
    };

    const trackVisitor = async () => {
      const hasNotified = sessionStorage.getItem("visitorNotified");
      const hasVisitedBefore = localStorage.getItem("hasVisitedBefore");
      if (hasNotified) return;

      const getBrowserInfo = () => {
        const ua = navigator.userAgent;
        let browser = "Unknown";
        if (ua.includes("Chrome") && !ua.includes("Edg") && !ua.includes("OPR")) browser = "Chrome";
        else if (ua.includes("Firefox")) browser = "Firefox";
        else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
        else if (ua.includes("Edg")) browser = "Edge";
        else if (ua.includes("OPR") || ua.includes("Opera")) browser = "Opera";
        const device = /Mobi|Android|iPhone|iPad/i.test(ua) ? "Mobile" : "Desktop";
        return `${browser} (${device})`;
      };

      const matchesDomainList = (ref, domains) =>
        domains.some((domain) => ref.includes(domain));

      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        const { city, country_name: country, ip } = data;

        const referrer = document.referrer || "";
        const params = new URLSearchParams(window.location.search);
        const utm = {
          source: params.get("utm_source"),
          medium: params.get("utm_medium"),
          campaign: params.get("utm_campaign"),
        };

        const socialMedia = ["facebook.com", "twitter.com", "instagram.com", "linkedin.com", "t.co", "reddit.com", "pinterest.com", "tiktok.com"];
        const searchEngines = ["google.", "bing.com", "yahoo.com", "duckduckgo.com", "baidu.com", "yandex.com"];

        let trafficSource = "Direct";
        if (utm.source) {
          trafficSource = `UTM: ${utm.source}`;
        } else if (referrer) {
          if (matchesDomainList(referrer, socialMedia)) trafficSource = "Social Media";
          else if (matchesDomainList(referrer, searchEngines)) trafficSource = "Search Engine";
          else trafficSource = `Referral: ${new URL(referrer).hostname}`;
        }

        const visitorInfo = {
          browser: getBrowserInfo(),
          ip,
          city,
          country,
          isReturning: !!hasVisitedBefore,
          trafficSource,
          utm,
        };

        import("axios").then(({ default: axios }) => {
          axios.post(BACKEND_URL, visitorInfo)
            .then(() => console.log("📍 Visitor info sent"))
            .catch((err) => console.error("❌ Visitor tracking error:", err.message));
        });

        setTimeout(() => {
          sessionStorage.setItem("visitorNotified", "true");
        }, 100);
        localStorage.setItem("hasVisitedBefore", "true");

      } catch (err) {
        console.error("❌ IP fetch error:", err.message);
      }
    };

    const trackAudioEvents = () => {
      const audios = document.querySelectorAll("audio");
      audios.forEach((audio) => {
        let playStart = null;
        const trackName = audio.closest("[data-title]")?.dataset.title || audio.src || "Unknown Track";

        audio.addEventListener("play", () => {
          playStart = Date.now();
          addEvent("Audio Play", { trackName });
        });

        const logAudioEnd = () => {
          if (playStart) {
            const playedFor = ((Date.now() - playStart) / 1000).toFixed(2);
            addEvent("Audio Pause/End", { trackName, playedFor: `${playedFor} seconds` });
            playStart = null;
          }
        };

        audio.addEventListener("pause", logAudioEnd);
        audio.addEventListener("ended", logAudioEnd);
      });
    };

    const handleClick = (e) => {
      const element = e.target.tagName;
      const text = e.target.innerText || e.target.alt || "No Text";
      addEvent("Click", { element, text, url: window.location.href });
    };

    // Exposed logging helpers
    window.logPayment = (beatTitle, amount, reference) =>
      addEvent("Payment", { beatTitle, amount: `₦${amount}`, reference });

    window.logSignIn = (email) => addEvent("Sign In", { email });
    window.logSignOut = (email) => addEvent("Sign Out", { email });
    window.logUpload = (filename, size, type) =>
      addEvent("File Upload", { filename, fileSize: size, contentType: type });

    trackVisitor();
    trackAudioEvents();
    document.addEventListener("click", handleClick);
    window.addEventListener("beforeunload", sendLog);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") sendLog();
    });
    window.addEventListener("pagehide", sendLog);

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("beforeunload", sendLog);
      document.removeEventListener("visibilitychange", sendLog);
      window.removeEventListener("pagehide", sendLog);
    };
  }, []);
}

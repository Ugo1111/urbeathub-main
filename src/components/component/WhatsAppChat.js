import React, { useState } from "react";

const WhatsAppChat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChatOptions = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div
      id="whatsapp-chat"
      style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}
    >
      <button
        className="chat-button"
        onClick={toggleChatOptions}
        style={{
          backgroundColor: "#db3056",
          color: "white",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          fontSize: "30px",
          textAlign: "center",
          lineHeight: "60px",
          border: "none",
          boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
          cursor: "pointer",
        }}
      >
        💬
      </button>

      {isChatOpen && (
        <div
          style={{
            backgroundColor: "#ddd",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            padding: "10px",
            textAlign: "center",
            position: "absolute",
            bottom: 70,
            right: 0,
            width: "200px",
          }}
        >
          <p style={{ margin: 0, color: "black" }}>Chat with:</p>

          <a
            href="https://wa.me/447776727121?text=Hi%20I%20need%20help%20with%20ur-beathub%20services"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              style={{
                backgroundColor: "#db3056",
                color: "white",
                padding: "10px",
                borderRadius: "5px",
                margin: "5px",
              }}
            >
              Lee
            </button>
          </a>

          <span style={{ margin: "0 5px", color: "#333" }}>or</span>

          <a
            href="https://wa.me/2347011886514?text=Hi%20I%20need%20help%20with%20ur-beathub%20services"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              style={{
                backgroundColor: "#db3056",
                color: "white",
                padding: "10px",
                borderRadius: "5px",
                margin: "5px",
              }}
            >
              Tayexy
            </button>
          </a>
        </div>
      )}
    </div>
  );
};

export default WhatsAppChat;

import React from "react";
import { motion } from "framer-motion";

export function ContactModal({ onClose }) {
  const [status, setStatus] = React.useState("idle");

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 1400);
  };

  React.useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const inputStyle = {
    width: "100%",
    height: 36,
    padding: "0 12px",
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 7,
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 150ms",
    letterSpacing: "-0.005em",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.2, ease: [0.19, 1, 0.22, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#111214",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.88)", letterSpacing: "-0.01em" }}>
              Get in touch
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
              We typically reply within a few hours.
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 6,
              transition: "background 150ms, color 150ms",
              padding: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.47 3.47a.75.75 0 0 1 1.06 0L8 6.94l3.47-3.47a.75.75 0 1 1 1.06 1.06L9.06 8l3.47 3.47a.75.75 0 1 1-1.06 1.06L8 9.06l-3.47 3.47a.75.75 0 0 1-1.06-1.06L6.94 8 3.47 4.53a.75.75 0 0 1 0-1.06Z" />
            </svg>
          </button>
        </div>

        <div style={{ padding: "20px" }}>
          {status === "sent" ? (
            <div style={{ padding: "32px 0", textAlign: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(94,210,140,0.1)", border: "1px solid rgba(94,210,140,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(94,210,140,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: 6 }}>Message sent!</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>We&apos;ll get back to you within 24 hours.</div>
              <button
                onClick={onClose}
                style={{ marginTop: 20, fontSize: 13, color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", transition: "color 150ms" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 6, fontWeight: 500 }}>Name *</label>
                  <input type="text" required placeholder="Your name" style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(94,106,210,0.5)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 6, fontWeight: 500 }}>Email *</label>
                  <input type="email" required placeholder="you@school.edu" style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(94,106,210,0.5)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 6, fontWeight: 500 }}>Subject</label>
                <input type="text" placeholder="e.g. Partnership, Support, Pricing" style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(94,106,210,0.5)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 6, fontWeight: 500 }}>Message *</label>
                <textarea required rows={4} placeholder="Your message..."
                  style={{ ...inputStyle, height: "auto", padding: "10px 12px", resize: "none" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(94,106,210,0.5)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 4 }}>
                <a href="mailto:contact@schoolace.ai" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none", transition: "color 150ms" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>
                  contact@schoolace.ai
                </a>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  style={{
                    height: 34,
                    padding: "0 18px",
                    borderRadius: 7,
                    border: "none",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#08090a",
                    background: status === "sending" ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.92)",
                    cursor: status === "sending" ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    transition: "background 150ms",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => { if (status !== "sending") e.currentTarget.style.background = "#ffffff"; }}
                  onMouseLeave={(e) => { if (status !== "sending") e.currentTarget.style.background = "rgba(255,255,255,0.92)"; }}
                >
                  {status === "sending" ? "Sending..." : "Send message"}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
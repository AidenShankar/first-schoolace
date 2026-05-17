import React from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

function ContactModal({ onClose }) {
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

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: null },
];

export function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [contactOpen, setContactOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = contactOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [contactOpen]);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          transition: "background 200ms, border-color 200ms",
          background: scrolled ? "rgba(8,9,10,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
        }}
      >
        <nav
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "0 24px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "rgba(255,255,255,0.88)" }}>
            <img src="https://media.base44.com/images/public/687ed6bea54c832b17eb40bc/36948c755_image.png" alt="SchoolACE" style={{ width: 36, height: 36, borderRadius: 8, display: "block", objectFit: "cover" }} />
            <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}>SchoolACE</span>
          </Link>

          <ul style={{ alignItems: "center", listStyle: "none", margin: 0, padding: 0 }} className="hidden md:flex">
            {navLinks.map((link) => (
              <li key={link.label}>
                {link.href ? (
                  <a href={link.href}
                    style={{ display: "block", padding: "0 14px", fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.45)", textDecoration: "none", transition: "color 150ms", letterSpacing: "-0.005em" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.88)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}>
                    {link.label}
                  </a>
                ) : (
                  <button onClick={() => setContactOpen(true)}
                    style={{ display: "block", padding: "0 14px", fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.45)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", transition: "color 150ms", letterSpacing: "-0.005em" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.88)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}>
                    {link.label}
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="#" className="hidden md:inline"
              style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "0 12px", transition: "color 150ms" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.88)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
              Log in
            </a>
            <a href="#"
              style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 14px", fontSize: 13, fontWeight: 500, color: "#08090a", background: "rgba(255,255,255,0.92)", borderRadius: 6, textDecoration: "none", letterSpacing: "-0.005em", transition: "background 150ms", whiteSpace: "nowrap" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.92)")}>
              Get started
            </a>

            <button onClick={() => setOpen(!open)} className="md:hidden"
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.45)", padding: 4, marginLeft: 4, display: "flex", alignItems: "center" }}
              aria-label="Toggle menu">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="1" y="7.5" width="14" height="1" rx="0.5" style={{ transformOrigin: "center", transition: "160ms", transform: open ? "rotate(45deg)" : "translateY(-3.5px)" }} />
                <rect x="1" y="7.5" width="14" height="1" rx="0.5" style={{ transformOrigin: "center", transition: "160ms", transform: open ? "rotate(-45deg)" : "translateY(3.5px)" }} />
              </svg>
            </button>
          </div>
        </nav>

        {open && (
          <div className="md:hidden" style={{ background: "rgba(8,9,10,0.97)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "16px 24px 24px" }}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {navLinks.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <a href={link.href} onClick={() => setOpen(false)}
                      style={{ display: "block", padding: "11px 0", fontSize: 15, color: "rgba(255,255,255,0.45)", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      {link.label}
                    </a>
                  ) : (
                    <button onClick={() => { setOpen(false); setContactOpen(true); }}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 0", fontSize: 15, color: "rgba(255,255,255,0.45)", background: "none", border: "none", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", fontFamily: "inherit" }}>
                      {link.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <a href="#" style={{ flex: 1, textAlign: "center", padding: "8px", fontSize: 14, color: "rgba(255,255,255,0.45)", textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6 }}>Log in</a>
              <a href="#" style={{ flex: 1, textAlign: "center", padding: "8px", fontSize: 14, fontWeight: 500, color: "#08090a", background: "rgba(255,255,255,0.92)", textDecoration: "none", borderRadius: 6 }}>Get started</a>
            </div>
          </div>
        )}
      </header>

      <AnimatePresence>
        {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
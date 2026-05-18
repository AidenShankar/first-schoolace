import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: null },
];

export function Navbar({ onContactOpen, signinUrl = "/newai" }) {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
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
          <img src="https://media.base44.com/images/public/687ed6bea54c832b17eb40bc/71eba0ef1_schoolacenewlogo.png" alt="SchoolACE" style={{ width: 36, height: 36, borderRadius: 8, display: "block", objectFit: "cover" }} />
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
                <button onClick={onContactOpen}
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
          <a href={signinUrl} className="hidden md:inline"
            style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "0 12px", transition: "color 150ms" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.88)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
            Log in
          </a>
          <a href={signinUrl}
            style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 14px", fontSize: 13, fontWeight: 500, color: "#08090a", background: "rgba(255,255,255,0.92)", borderRadius: 6, textDecoration: "none", letterSpacing: "-0.005em", transition: "background 150ms", whiteSpace: "nowrap" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.92)")}>
            Get started
          </a>


        </div>
      </nav>


    </header>
  );
}
import React from "react";
import { motion, useInView } from "framer-motion";

export function Contact() {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [status, setStatus] = React.useState("idle");

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 1400);
  };

  const inputStyle = {
    width: "100%",
    height: 36,
    padding: "0 12px",
    fontSize: 13,
    color: "var(--color-text-primary)",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 6,
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 150ms",
  };

  return (
    <section ref={ref} id="contact" style={{ padding: "0 24px 96px", maxWidth: 1120, margin: "0 auto" }}>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 80 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }} className="md:grid-cols-2 grid-cols-1">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-accent)", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 14px" }}>
              Contact
            </p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--color-text-primary)", lineHeight: 1.1, margin: "0 0 16px" }}>
              Get in touch.
            </h2>
            <p style={{ fontSize: 15, color: "var(--color-text-tertiary)", lineHeight: 1.65, margin: "0 0 24px", maxWidth: 360 }}>
              Questions about pricing, implementation, or a custom plan for your district? We&apos;d love to hear from you.
            </p>
            <a
              href="mailto:contact@schoolace.ai"
              style={{ fontSize: 13, color: "var(--color-text-secondary)", textDecoration: "none", transition: "color 150ms" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
            >
              contact@schoolace.ai →
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {status === "sent" ? (
              <div style={{ padding: "40px 0" }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 8 }}>Message sent.</div>
                <div style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>We&apos;ll get back to you within 24 hours.</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 6 }}>Name *</label>
                    <input type="text" required placeholder="Your name" style={inputStyle}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(94,106,210,0.4)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 6 }}>Email *</label>
                    <input type="email" required placeholder="you@school.edu" style={inputStyle}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(94,106,210,0.4)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 6 }}>Subject</label>
                  <input type="text" placeholder="e.g. Partnership, Support" style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(94,106,210,0.4)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 6 }}>Message *</label>
                  <textarea required rows={5} placeholder="Your message..."
                    style={{ ...inputStyle, height: "auto", padding: "10px 12px", resize: "none" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(94,106,210,0.4)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")} />
                </div>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  style={{
                    height: 36,
                    borderRadius: 6,
                    border: "none",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#08090a",
                    background: status === "sending" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.92)",
                    cursor: status === "sending" ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    transition: "background 150ms",
                  }}
                >
                  {status === "sending" ? "Sending..." : "Send message"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
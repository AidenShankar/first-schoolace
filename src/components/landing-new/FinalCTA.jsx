import React from "react";
import { motion, useInView } from "framer-motion";

export function FinalCTA() {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} style={{ padding: "0 24px 96px", maxWidth: 1120, margin: "0 auto" }}>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 80 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          style={{ maxWidth: 640 }}
        >
          <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 600, letterSpacing: "-0.04em", color: "var(--color-text-primary)", lineHeight: 1.02, margin: "0 0 20px" }}>
            Ready to transform your classroom?
          </h2>
          <p style={{ fontSize: 16, color: "var(--color-text-tertiary)", lineHeight: 1.65, margin: "0 0 36px", maxWidth: 440 }}>
            Start for free today. No credit card required. Set up in under 5 minutes.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <a
              href="#"
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 40,
                padding: "0 22px",
                fontSize: 14,
                fontWeight: 500,
                color: "#08090a",
                background: "rgba(255,255,255,0.92)",
                borderRadius: 7,
                textDecoration: "none",
                transition: "background 150ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.92)")}
            >
              Get started for free
            </a>
            <a
              href="#contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 40,
                padding: "0 22px",
                fontSize: 14,
                color: "var(--color-text-secondary)",
                textDecoration: "none",
                transition: "color 150ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
            >
              Talk to sales →
            </a>
          </div>
          <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: "8px 24px" }}>
            {["No credit card required", "Free forever plan", "FERPA & COPPA compliant", "Cancel anytime"].map((item) => (
              <span key={item} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--color-text-quaternary)" }}>
                <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
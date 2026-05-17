import React from "react";
import { motion, useInView } from "framer-motion";

const items = [
  { title: "FERPA & COPPA compliant", body: "Built from day one to meet federal student privacy laws. No student data is ever sold or used for advertising." },
  { title: "Enterprise-grade security", body: "SOC 2 Type II, end-to-end encryption at rest and in transit, role-based access controls." },
  { title: "Responsible AI", body: "All AI models are audited for bias. No generative AI output is shown to students without teacher review." },
  { title: "Transparency & control", body: "Full data export, deletion on request, and audit logs for every AI action taken in your classroom." },
];

export function Privacy() {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} style={{ padding: "0 24px 96px", maxWidth: 1120, margin: "0 auto" }}>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 80 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }} className="md:grid-cols-2 grid-cols-1">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-accent)", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 14px" }}>
              Security & privacy
            </p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--color-text-primary)", lineHeight: 1.1, margin: "0 0 20px" }}>
              Privacy-first by design.
            </h2>
            <p style={{ fontSize: 15, color: "var(--color-text-tertiary)", lineHeight: 1.65, margin: "0 0 28px", maxWidth: 380 }}>
              Student data is sacred. Every decision we make — from infrastructure to AI models — starts with privacy.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {["FERPA", "COPPA", "SOC 2"].map((badge) => (
                <span
                  key={badge}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: 26,
                    padding: "0 10px",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 5,
                    letterSpacing: "0.02em",
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" }}>
            {items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                style={{
                  padding: "20px 24px",
                  background: "rgba(255,255,255,0.015)",
                  borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.06)" : undefined,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.01em", marginBottom: 6 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", lineHeight: 1.65 }}>
                  {item.body}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
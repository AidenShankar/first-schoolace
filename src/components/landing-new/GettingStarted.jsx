import React from "react";
import { motion, useInView } from "framer-motion";

const steps = [
  { n: "01", title: "Create your account", body: "Sign up free in under 60 seconds. No credit card required." },
  { n: "02", title: "Set up your class", body: "Add your students, import a roster, or invite via link." },
  { n: "03", title: "Let ACE do the work", body: "Start grading, generating content, and tutoring on day one." },
];

export function GettingStarted() {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} style={{ padding: "0 24px 96px", maxWidth: 1120, margin: "0 auto" }}>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 80 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 48 }}
        >
          <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-accent)", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 14px" }}>
            Get started
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--color-text-primary)", lineHeight: 1.1, margin: 0 }}>
            Up and running in 5 minutes.
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 0, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden", marginBottom: 32 }}>
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{
                padding: "28px 24px",
                background: "rgba(255,255,255,0.015)",
                borderRight: i < steps.length - 1 ? "1px solid rgba(255,255,255,0.06)" : undefined,
                position: "relative",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-quaternary)", letterSpacing: "0.06em", marginBottom: 14 }}>
                {step.n}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.02em", margin: "0 0 10px" }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", lineHeight: 1.7, margin: 0 }}>
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <a
            href="#"
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: 36,
              padding: "0 18px",
              fontSize: 13,
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
            Start for free →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
import React from "react";
import { motion, useInView } from "framer-motion";

const problems = [
  {
    heading: "Grading consumes hours every week",
    body: "Teachers spend up to 40% of their time on administrative work — grading, feedback, paperwork. Time that should go to students.",
  },
  {
    heading: "One-size-fits-all instruction fails students",
    body: "Every student learns differently. Traditional classrooms can't adapt in real time to each student's pace, gaps, and strengths.",
  },
  {
    heading: "Learning insights arrive too late",
    body: "By the time assessments surface struggling students, weeks have passed. Early intervention is impossible without real-time data.",
  },
];

export function Problem() {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} id="features" style={{ padding: "0 24px 96px", maxWidth: 1120, margin: "0 auto" }}>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 80 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: 520, marginBottom: 48 }}
        >
          <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-accent)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14, margin: "0 0 14px" }}>
            The problem
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--color-text-primary)", lineHeight: 1.1, margin: "14px 0 0" }}>
            <span style={{ color: "var(--color-text-primary)" }}>Education is broken.</span>
            <br />
            <span style={{ color: "var(--color-text-tertiary)" }}>We&apos;re here to fix it.</span>
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" }}>
          {problems.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{
                padding: "28px 24px",
                background: "rgba(255,255,255,0.015)",
                borderRight: i < problems.length - 1 ? "1px solid rgba(255,255,255,0.06)" : undefined,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-quaternary)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
                0{i + 1}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.02em", lineHeight: 1.3, margin: "0 0 10px" }}>
                {p.heading}
              </h3>
              <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", lineHeight: 1.7, margin: 0 }}>
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
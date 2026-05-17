import React from "react";
import { motion, useInView } from "framer-motion";

function GradingPanel() {
  const rubric = [
    { label: "Thesis & Argument", score: 4, max: 5 },
    { label: "Evidence & Support", score: 5, max: 5 },
    { label: "Analysis & Insight", score: 4, max: 5 },
    { label: "Clarity & Structure", score: 3, max: 5 },
    { label: "Grammar & Mechanics", score: 5, max: 5 },
  ];

  return (
    <div style={{ position: "relative", padding: "0 0 32px" }}>
      <div
        style={{
          background: "#0f1012",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a0b0d" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(94,106,210,0.7)" }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.6)", letterSpacing: "-0.01em" }}>AI Grading</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>·</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Emma Johnson</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: "rgba(94,210,140,0.8)", background: "rgba(94,210,140,0.1)", border: "1px solid rgba(94,210,140,0.2)", borderRadius: 4, padding: "2px 7px", fontWeight: 500 }}>
              Graded
            </span>
          </div>
        </div>

        <div style={{ display: "flex" }}>
          <div style={{ flex: 1, padding: "16px 18px", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
              Essay · The Causes of WW2
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.8 }}>
              <span>The outbreak of World War II was the result of a complex interplay of </span>
              <span style={{ background: "rgba(94,106,210,0.2)", borderBottom: "1px solid rgba(94,106,210,0.5)", color: "rgba(255,255,255,0.7)" }}>political failures, economic desperation, and unchecked nationalism</span>
              <span>. The Treaty of Versailles, rather than securing lasting peace, sowed the seeds of resentment...</span>
            </div>
            <div style={{ marginTop: 14, padding: "10px 12px", background: "rgba(94,106,210,0.08)", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(94,106,210,0.9)", marginBottom: 5, letterSpacing: "0.03em" }}>ACE FEEDBACK</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>
                Strong thesis — clearly identifies three causal factors. Consider expanding your analysis of economic factors with specific data (e.g., German unemployment rates 1931–33).
              </div>
            </div>
          </div>

          <div style={{ width: 160, padding: "16px 14px", flexShrink: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
              Rubric
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rubric.map((r) => (
                <div key={r.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{r.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: r.score === r.max ? "rgba(94,210,140,0.8)" : "rgba(255,255,255,0.5)" }}>{r.score}/{r.max}</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
                    <div style={{ height: "100%", borderRadius: 2, width: `${(r.score / r.max) * 100}%`, background: r.score === r.max ? "rgba(94,210,140,0.6)" : "rgba(94,106,210,0.6)" }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "-0.04em" }}>21<span style={{ fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.3)" }}>/25</span></span>
            </div>
          </div>
        </div>

        <div style={{ padding: "10px 18px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "#0a0b0d", display: "flex", alignItems: "center", gap: 16 }}>
          {["32 essays graded", "Avg: 84%", "2 flagged for review"].map((item, i) => (
            <span key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{item}</span>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.2)" }}>Graded in 0.8s per essay</span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: -24,
          width: 200,
          background: "#0f1012",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          padding: "12px 14px",
          boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.2)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>
          Class Summary
        </div>
        {[
          { name: "A (90-100%)", count: 8, color: "rgba(94,210,140,0.7)" },
          { name: "B (80-89%)", count: 14, color: "rgba(94,106,210,0.7)" },
          { name: "C (70-79%)", count: 7, color: "rgba(210,170,94,0.7)" },
          { name: "Below 70%", count: 3, color: "rgba(210,94,94,0.7)" },
        ].map((grade) => (
          <div key={grade.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: grade.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", flex: 1 }}>{grade.name}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>{grade.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const features = [
  { title: "AI Grading", desc: "Grade essays and assignments in seconds with rubric-aligned feedback." },
  { title: "Assessment Generation", desc: "Generate standards-aligned quizzes from any topic or document." },
  { title: "Smart Scheduling", desc: "Auto-schedule lessons and assignments based on curriculum pacing." },
  { title: "Real-Time Analytics", desc: "See exactly where each student is struggling before the test." },
  { title: "Parent Reports", desc: "Auto-generate personalized progress reports in one click." },
  { title: "ACE AI Agent", desc: "Your always-on teaching assistant that flags issues and suggests next steps." },
];

export function ForEducators() {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [expanded, setExpanded] = React.useState(false);

  return (
    <section ref={ref} style={{ padding: "0 24px 120px", maxWidth: 1120, margin: "0 auto" }}>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 80 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 48 }}
        >
          <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-accent)", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 14px" }}>
            For educators
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--color-text-primary)", lineHeight: 1.1, margin: "0 0 16px", maxWidth: 480 }}>
            Save hours every week. Focus on what matters.
          </h2>
          <p style={{ fontSize: 15, color: "var(--color-text-tertiary)", lineHeight: 1.65, margin: 0, maxWidth: 440 }}>
            ACE AI acts as your co-pilot and handles grading, scheduling, and reporting — so you can spend more time with your students.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }} className="md:grid-cols-2 grid-cols-1">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <GradingPanel />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" }}>
              {features.map((f, i) => (
                <div
                  key={i}
                  style={{
                    padding: "28px 20px",
                    background: "rgba(255,255,255,0.015)",
                    borderRight: i % 2 === 0 ? "1px solid rgba(255,255,255,0.06)" : undefined,
                    borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.06)" : undefined,
                    transition: "background 200ms",
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(94,106,210,0.55)", marginBottom: 16 }} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.02em", marginBottom: expanded ? 8 : 0 }}>{f.title}</div>
                  <motion.div
                    initial={false}
                    animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", lineHeight: 1.6 }}>{f.desc}</div>
                  </motion.div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                marginTop: 12,
                background: "none",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 7,
                padding: "8px 16px",
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "inherit",
                transition: "color 150ms, border-color 150ms",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
            >
              {expanded ? "See less" : "See more"}
              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: "inline-flex" }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 8L1 3h10L6 8z" />
                </svg>
              </motion.span>
            </button>

            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              {["FERPA & COPPA compliant", "Works with any curriculum", "Free to get started"].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--color-text-tertiary)" }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--color-accent)", flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
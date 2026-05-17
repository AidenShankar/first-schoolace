import React from "react";
import { motion, useInView, animate } from "framer-motion";

const stats = [
  { value: 180, suffix: " min", label: "Saved per teacher per week" },
  { value: 95, suffix: "%", label: "Teacher satisfaction rate" },
  { value: 53, suffix: "%", label: "Increase in student engagement" },
  { value: 500, suffix: "+", label: "Users on SchoolACE" },
  { value: 91, suffix: "%", label: "AI grading accuracy" },
  { value: 5, suffix: "×", label: "Faster feedback turnaround" },
];

function Counter({ value, suffix }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  React.useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate(v) {
        if (ref.current) {
          ref.current.textContent =
            value >= 1000 ? Math.round(v).toLocaleString() + suffix : Math.round(v) + suffix;
        }
      },
    });
    return controls.stop;
  }, [inView, value, suffix]);

  return (
    <span ref={ref} style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, letterSpacing: "-0.04em", color: "var(--color-text-primary)", lineHeight: 1 }}>
      0{suffix}
    </span>
  );
}

function AnalyticsPanel() {
  const weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
  const classAvg = [71, 73, 74, 76, 80, 83, 85, 87];
  const engagement = [55, 58, 62, 68, 74, 79, 84, 91];
  const maxVal = 100;

  const students = [
    { name: "Emma J.", grade: 94, delta: "+12%", trend: "up" },
    { name: "Carlos M.", grade: 78, delta: "+8%", trend: "up" },
    { name: "Aisha P.", grade: 61, delta: "-3%", trend: "down", flagged: true },
    { name: "Noah T.", grade: 88, delta: "+5%", trend: "up" },
  ];

  return (
    <div
      style={{
        background: "#0f1012",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#0a0b0d", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>Class Analytics</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>·</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Period 3 · Biology</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <span style={{ fontSize: 10, color: "rgba(94,106,210,0.8)" }}>8 weeks</span>
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
            {weeks.map((w, i) => (
              <div key={w} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, height: "100%", justifyContent: "flex-end" }}>
                <div style={{ width: "100%", display: "flex", gap: 2, alignItems: "flex-end", height: "100%" }}>
                  <div
                    style={{
                      flex: 1,
                      borderRadius: "3px 3px 0 0",
                      background: "rgba(94,106,210,0.5)",
                      height: `${(classAvg[i] / maxVal) * 100}%`,
                      transition: "height 0.5s ease",
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      borderRadius: "3px 3px 0 0",
                      background: "rgba(94,210,140,0.35)",
                      height: `${(engagement[i] / maxVal) * 100}%`,
                      transition: "height 0.5s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            {weeks.map((w) => (
              <div key={w} style={{ flex: 1, textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.2)" }}>{w}</div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(94,106,210,0.5)" }} />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Avg Grade</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(94,210,140,0.35)" }} />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Engagement</span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
            Students
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {students.map((s) => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: s.flagged ? "rgba(210,94,94,0.15)" : "rgba(94,106,210,0.1)", border: `1px solid ${s.flagged ? "rgba(210,94,94,0.3)" : "rgba(94,106,210,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 600, color: s.flagged ? "rgba(210,94,94,0.8)" : "rgba(94,106,210,0.7)", flexShrink: 0 }}>
                  {s.name[0]}
                </div>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", flex: 1 }}>{s.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: s.grade >= 80 ? "rgba(255,255,255,0.65)" : s.grade >= 70 ? "rgba(210,170,94,0.8)" : "rgba(210,94,94,0.8)" }}>{s.grade}%</span>
                  <span style={{ fontSize: 10, color: s.trend === "up" ? "rgba(94,210,140,0.7)" : "rgba(210,94,94,0.7)" }}>{s.delta}</span>
                  {s.flagged && <span style={{ fontSize: 9, color: "rgba(210,94,94,0.7)", background: "rgba(210,94,94,0.1)", border: "1px solid rgba(210,94,94,0.2)", borderRadius: 3, padding: "1px 5px" }}>At risk</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "#0a0b0d", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(94,210,140,0.6)" }} />
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>Class average improved 16% over 8 weeks</span>
      </div>
    </div>
  );
}

export function Traction() {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} id="traction" style={{ padding: "0 24px 96px", maxWidth: 1120, margin: "0 auto" }}>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 80 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 56 }}
        >
          <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-accent)", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 14px" }}>
            Impact
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--color-text-primary)", lineHeight: 1.1, margin: 0, maxWidth: 480 }}>
            Results that speak for themselves.
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }} className="md:grid-cols-2 grid-cols-1">
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" }}>
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  style={{
                    padding: "24px 20px",
                    background: "rgba(255,255,255,0.015)",
                    borderRight: i % 2 === 0 ? "1px solid rgba(255,255,255,0.06)" : undefined,
                    borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.06)" : undefined,
                  }}
                >
                  <div style={{ marginBottom: 6 }}>
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", lineHeight: 1.4 }}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <AnalyticsPanel />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
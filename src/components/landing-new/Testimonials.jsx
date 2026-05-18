import React from "react";
import { motion, useInView } from "framer-motion";

const featured = [
  {
    quote: "I used to spend a full Sunday grading. With ACE, I'm done in an hour — and the feedback is genuinely better than what I wrote myself.",
    name: "Amber Kraver",
    role: "8th Grade Science, Valley Christian Junior High School",
    initials: "AK",
    bg: "#e4e8ff",
    textColor: "#08090a",
    accentColor: "#5e6ad2",
  },
  {
    quote: "Engagement scores jumped 40% in the first month. ACE is the first ed-tech product that actually delivers.",
    name: "James Torres",
    role: "Principal, Jefferson Academy",
    initials: "JT",
    bg: "#5e6ad2",
    textColor: "#ffffff",
    accentColor: "rgba(255,255,255,0.6)",
  },
];

const secondary = [
  { name: "Priya K.", role: "Math Teacher, Grade 6", quote: "My struggling students finally have something that meets them where they are. ACE explains concepts five different ways until it clicks." },
  { name: "Michael R.", role: "District Curriculum Director", quote: "For the first time I can see exactly which concepts are failing across every classroom — in real time." },
  { name: "Lisa C.", role: "5th Grade Teacher", quote: "Parents love the automatic progress reports. I used to spend a weekend on those. Now ACE does it and I review in 10 minutes." },
  { name: "Tamara W.", role: "Special Education Teacher", quote: "The ability to instantly adapt any assignment for different learning needs is transformative." },
];

export function Testimonials() {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} id="testimonials" style={{ padding: "0 24px 96px", maxWidth: 1120, margin: "0 auto" }}>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 80 }}>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12, marginBottom: 12 }}
          className="md:grid-cols-[1.6fr_1fr] grid-cols-1"
        >
          {featured.map((f, i) => (
            <div
              key={i}
              style={{
                background: f.bg,
                borderRadius: 12,
                padding: "48px 44px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 340,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  right: -20,
                  top: -20,
                  fontSize: 200,
                  fontWeight: 700,
                  color: f.textColor === "#ffffff" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  lineHeight: 1,
                  letterSpacing: "-0.06em",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {f.initials}
              </div>

              <p
                style={{
                  fontSize: "clamp(22px, 3vw, 32px)",
                  fontWeight: 500,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.25,
                  color: f.textColor,
                  margin: 0,
                  maxWidth: 520,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                &ldquo;{f.quote}&rdquo;
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 40, position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: f.textColor === "#ffffff" ? "rgba(255,255,255,0.2)" : "rgba(94,106,210,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 600,
                    color: f.textColor === "#ffffff" ? "#fff" : f.accentColor,
                    flexShrink: 0,
                  }}
                >
                  {f.initials}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: f.textColor, letterSpacing: "-0.01em" }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: f.accentColor, marginTop: 1 }}>{f.role}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 32 }}
        >
          {secondary.map((q, i) => (
            <div
              key={i}
              style={{
                padding: "22px 20px",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65, margin: "0 0 16px" }}>
                &ldquo;{q.quote}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(94,106,210,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "rgba(94,106,210,0.8)", flexShrink: 0 }}>
                  {q.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{q.name}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-quaternary)" }}>{q.role}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}
        >
          <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", margin: 0 }}>
            SchoolACE powers over <strong style={{ fontWeight: 600, color: "var(--color-text-secondary)" }}>500+</strong> educators. From individual classrooms to entire districts.
          </p>
          <a
            href="#"
            style={{ fontSize: 13, color: "var(--color-text-tertiary)", textDecoration: "none", transition: "color 150ms", whiteSpace: "nowrap" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-tertiary)")}
          >
            Read stories →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
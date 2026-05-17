import React from "react";
import { motion, useAnimate, stagger } from "framer-motion";

const word = (delay) => ({
  initial: { opacity: 0, filter: "blur(10px)", y: "20%" },
  animate: { opacity: 1, filter: "blur(0px)", y: "0%" },
  transition: { duration: 0.8, delay, ease: [0.19, 1, 0.22, 1] },
});

const backers = [
  {
    name: "Khosla Ventures",
    font: "'Inter', sans-serif",
    size: 16,
    weight: 500,
    spacing: "-0.02em",
    icon: (
      <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor">
        <polygon points="7,1 13,13 1,13" />
      </svg>
    ),
  },
  {
    name: "Pear VC",
    font: "'Plus Jakarta Sans', sans-serif",
    size: 18,
    weight: 500,
    spacing: "-0.01em",
    icon: (
      <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
        <ellipse cx="6" cy="9" rx="5" ry="5" />
        <path d="M6 4 Q8 1 10 2" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "BLACKROCK",
    font: "'Barlow Condensed', sans-serif",
    size: 20,
    weight: 700,
    spacing: "0.08em",
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
        <rect x="0" y="0" width="13" height="13" rx="2" />
      </svg>
    ),
  },
  {
    name: "Samsung Ventures",
    font: "'Outfit', sans-serif",
    size: 17,
    weight: 600,
    spacing: "-0.01em",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
        <path d="M2 7 Q7 1 12 7 Q7 13 2 7Z" />
      </svg>
    ),
  },
  {
    name: "PEGASUS TECH",
    font: "'Bebas Neue', sans-serif",
    size: 22,
    weight: 400,
    spacing: "0.1em",
    icon: (
      <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
        <path d="M0 6 Q4 0 8 3 Q10 1 16 2 Q12 4 10 5 Q12 8 8 12 Q8 8 6 7 Q3 9 0 6Z" />
      </svg>
    ),
  },
  {
    name: "redpoint",
    font: "'DM Sans', sans-serif",
    size: 18,
    weight: 400,
    spacing: "-0.01em",
    icon: (
      <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
        <circle cx="5" cy="5" r="5" />
        <path d="M5 10 L5 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

function TypingText({ text, delay = 0 }) {
  const chars = text.split("");
  return (
    <span style={{ position: "relative" }}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0, delay: delay + i * 0.045 }}
          style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : undefined }}
        >
          {char}
        </motion.span>
      ))}
      <motion.span
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: delay + chars.length * 0.045 + 0.3, repeat: Infinity, repeatType: "reverse" }}
        style={{
          display: "inline-block",
          width: 2,
          height: "0.85em",
          background: "currentColor",
          verticalAlign: "text-bottom",
          marginLeft: 2,
          borderRadius: 1,
        }}
      />
    </span>
  );
}

export function Hero() {
  return (
    <main style={{ overflow: "hidden" }}>
      <section style={{ position: "relative", paddingTop: 160 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center" }}>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
              <motion.a
                href="#"
                {...word(0.1)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                  color: "var(--color-text-secondary)",
                  textDecoration: "none",
                  letterSpacing: "-0.005em",
                  transition: "color 150ms",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--color-accent)",
                    boxShadow: "0 0 0 3px rgba(94,106,210,0.25)",
                  }}
                />
                <span style={{ color: "var(--color-text-secondary)", fontWeight: 500 }}>ACE AI is live</span>
                <span>The future of AI-powered education</span>
                <span style={{ color: "var(--color-text-quaternary)" }}>→</span>
              </motion.a>
            </div>

            <h1
              style={{
                fontSize: "clamp(40px, 7vw, 72px)",
                fontWeight: 600,
                lineHeight: 1.02,
                letterSpacing: "-0.04em",
                color: "var(--color-text-primary)",
                margin: "0 auto 24px",
                maxWidth: 840,
              }}
            >
              <span aria-hidden="true" style={{ display: "block" }}>
                <TypingText text="Education, Supercharged" delay={0.2} />
                <br />
                <TypingText text="by ACE AI" delay={0.2 + "Education, Supercharged".length * 0.045 + 0.15} />
              </span>
              <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
                Education, Supercharged by ACE AI
              </span>
            </h1>

            <motion.p
              {...word(0.44)}
              style={{
                fontSize: 17,
                color: "var(--color-text-tertiary)",
                maxWidth: 520,
                margin: "0 auto 40px",
                lineHeight: 1.6,
                letterSpacing: "-0.01em",
              }}
            >
              Purpose-built for teachers and students.
            </motion.p>

            <motion.div
              {...word(0.54)}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}
            >
              <a
                href="#"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: 38,
                  padding: "0 20px",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#08090a",
                  background: "rgba(255,255,255,0.92)",
                  borderRadius: 7,
                  textDecoration: "none",
                  letterSpacing: "-0.005em",
                  transition: "background 150ms",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#ffffff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.92)")}
              >
                Get started for free
              </a>
              <a
                href="#"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: 38,
                  padding: "0 20px",
                  fontSize: 14,
                  fontWeight: 400,
                  color: "var(--color-text-secondary)",
                  textDecoration: "none",
                  letterSpacing: "-0.005em",
                  transition: "color 150ms",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
              >
                Request a demo →
              </a>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.7, ease: [0.19, 1, 0.22, 1] }}
          style={{ padding: "0 16px", maxWidth: 1120, margin: "72px auto 0" }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 200,
              background: "linear-gradient(to top, #08090a, transparent)",
              zIndex: 10,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "relative",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              overflow: "hidden",
              background: "#0d0e10",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 32px 64px rgba(0,0,0,0.6)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                background: "#0a0b0d",
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
              <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontWeight: 400, letterSpacing: 0 }}>
                  SchoolACE — AI Dashboard
                </span>
              </div>
            </div>

            <div style={{ display: "flex", height: 460 }}>
              <div
                style={{
                  width: 200,
                  borderRight: "1px solid rgba(255,255,255,0.05)",
                  background: "#09090b",
                  padding: "14px 10px",
                  flexShrink: 0,
                  display: "none",
                }}
                className="sm:block"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "5px 8px",
                    borderRadius: 6,
                    marginBottom: 16,
                    cursor: "default",
                  }}
                >
                  <div style={{ width: 18, height: 18, borderRadius: 4, background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="10" height="10" viewBox="0 0 100 100" fill="white">
                      <path d="M1.22541 61.5228c-.2225-.9485.90748-1.5459 1.59638-.857L39.3342 97.1782c.6889.6889.0915 1.8189-.857 1.5964C20.0515 94.4522 5.54779 79.9485 1.22541 61.5228ZM.00189 46.8891c-.0176.2833.0889.5599.2896.7606L52.3503 99.7085c.2007.2007.4773.3075.7606.2896 2.3692-.1476 4.6938-.46 6.9624-.9259.7645-.157 1.0301-1.0963.4782-1.6481L2.576 39.4485c-.5519-.5519-1.4912-.2863-1.6482.4782-.4659 2.2686-.7783 4.5932-.9259 6.9624ZM4.21093 29.7054c-.16649.3738-.08169.8106.20765 1.1l64.77602 64.776c.2894.2894.7262.3742 1.1.2077 1.7861-.7956 3.5171-1.6927 5.1855-2.684.5521-.328.6373-1.0867.1832-1.5407L8.43566 24.3367c-.45409-.4541-1.21271-.3689-1.54074.1832-.99132 1.6684-1.88843 3.3994-2.68399 5.1855ZM12.6587 18.074c-.3701-.3701-.393-.9637-.0443-1.3541C21.7795 6.45931 35.1114 0 49.9519 0 77.5927 0 100 22.4073 100 50.0481c0 14.8405-6.4593 28.1724-16.7199 37.3375-.3903.3487-.984.3258-1.3542-.0443L12.6587 18.074Z" />
                    </svg>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "-0.01em" }}>SchoolACE</span>
                </div>

                {[
                  { label: "Dashboard", active: true },
                  { label: "Students" },
                  { label: "Assignments" },
                  { label: "Grades" },
                  { label: "AI Tools" },
                  { label: "Analytics" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "5px 8px",
                      borderRadius: 5,
                      marginBottom: 1,
                      fontSize: 12,
                      fontWeight: item.active ? 500 : 400,
                      color: item.active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)",
                      background: item.active ? "rgba(255,255,255,0.06)" : "transparent",
                      cursor: "default",
                    }}
                  >
                    <span style={{ width: 12, height: 12, borderRadius: 3, background: item.active ? "rgba(94,106,210,0.5)" : "rgba(255,255,255,0.08)", flexShrink: 0 }} />
                    {item.label}
                  </div>
                ))}
              </div>

              <div style={{ flex: 1, padding: "20px 24px", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.8)", letterSpacing: "-0.02em" }}>AI Dashboard</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>Overview · This week</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <div style={{ height: 26, padding: "0 10px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", fontSize: 11, color: "rgba(255,255,255,0.3)", cursor: "default" }}>Filter</div>
                    <div style={{ height: 26, padding: "0 10px", borderRadius: 5, background: "rgba(94,106,210,0.15)", border: "1px solid rgba(94,106,210,0.25)", display: "flex", alignItems: "center", fontSize: 11, color: "rgba(94,106,210,0.9)", cursor: "default", fontWeight: 500 }}>New assignment</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
                  {[
                    { label: "Time saved this week", value: "+3.2 hrs", delta: "+12%", positive: true },
                    { label: "Average grade", value: "87.4%", delta: "+4.1%", positive: true },
                    { label: "Student engagement", value: "91%", delta: "+18%", positive: true },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.06)",
                        background: "rgba(255,255,255,0.02)",
                      }}
                    >
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginBottom: 6, letterSpacing: "0.01em" }}>{stat.label}</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontSize: 18, fontWeight: 600, color: "rgba(255,255,255,0.82)", letterSpacing: "-0.03em" }}>{stat.value}</span>
                        <span style={{ fontSize: 10, color: "rgba(94,210,94,0.8)", fontWeight: 500 }}>{stat.delta}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.015)",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)", letterSpacing: "0.01em" }}>RECENT ACTIVITY</span>
                    <span style={{ fontSize: 10, color: "rgba(94,106,210,0.7)", cursor: "default" }}>View all →</span>
                  </div>
                  {[
                    { text: "Auto-graded 32 essays", time: "2m ago", type: "grade" },
                    { text: "Generated quiz for Chapter 4", time: "5m ago", type: "ai" },
                    { text: "Emma K. completed all assignments", time: "8m ago", type: "student" },
                    { text: "Sent progress reports to 28 parents", time: "12m ago", type: "report" },
                    { text: "ACE AI flagged 3 students for review", time: "18m ago", type: "alert" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 14px",
                        borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : undefined,
                      }}
                    >
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(94,106,210,0.6)", flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", flex: 1 }}>{item.text}</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", flexShrink: 0 }}>{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section style={{ padding: "72px 24px 64px", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 36, fontWeight: 500 }}>
            Validated by
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px 0" }}>
            {backers.map((b) => (
              <div
                key={b.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "rgba(255,255,255,0.75)",
                  cursor: "default",
                  flex: "1 1 auto",
                  justifyContent: "center",
                }}
              >
                <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>{b.icon}</span>
                <span style={{ fontSize: b.size, fontWeight: b.weight, letterSpacing: b.spacing, whiteSpace: "nowrap", fontFamily: b.font }}>{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
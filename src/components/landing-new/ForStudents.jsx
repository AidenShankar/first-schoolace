import React from "react";
import { motion, useInView } from "framer-motion";

function TutorPanel() {
  const messages = [
    {
      from: "student",
      text: "Hey ACE, I submitted my history essay two weeks ago — did Mr. Rivera leave feedback yet?",
    },
    {
      from: "ace",
      text: "Yes! Mr. Rivera graded it on Oct 14th. You got an 84% — he said your thesis was strong but wanted more evidence on the economic causes of WW2.",
    },
    {
      from: "student",
      text: "Oh I forgot about that. Can you help me understand what he meant?",
    },
    {
      from: "ace",
      text: "Of course. He flagged this line: 'economic desperation led to instability' — and wanted specific data like unemployment rates or GDP drops. I pulled your Chapter 6 notes and you actually have that data. Want me to help you revise?",
      thinking: true,
    },
  ];

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          background: "#0f1012",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#0a0b0d", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(94,106,210,0.2)", border: "1px solid rgba(94,106,210,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 100 100" fill="rgba(94,106,210,0.9)">
              <path d="M1.22541 61.5228c-.2225-.9485.90748-1.5459 1.59638-.857L39.3342 97.1782c.6889.6889.0915 1.8189-.857 1.5964C20.0515 94.4522 5.54779 79.9485 1.22541 61.5228ZM.00189 46.8891c-.0176.2833.0889.5599.2896.7606L52.3503 99.7085c.2007.2007.4773.3075.7606.2896 2.3692-.1476 4.6938-.46 6.9624-.9259.7645-.157 1.0301-1.0963.4782-1.6481L2.576 39.4485c-.5519-.5519-1.4912-.2863-1.6482.4782-.4659 2.2686-.7783 4.5932-.9259 6.9624ZM4.21093 29.7054c-.16649.3738-.08169.8106.20765 1.1l64.77602 64.776c.2894.2894.7262.3742 1.1.2077 1.7861-.7956 3.5171-1.6927 5.1855-2.684.5521-.328.6373-1.0867.1832-1.5407L8.43566 24.3367c-.45409-.4541-1.21271-.3689-1.54074.1832-.99132 1.6684-1.88843 3.3994-2.68399 5.1855ZM12.6587 18.074c-.3701-.3701-.393-.9637-.0443-1.3541C21.7795 6.45931 35.1114 0 49.9519 0 77.5927 0 100 22.4073 100 50.0481c0 14.8405-6.4593 28.1724-16.7199 37.3375-.3903.3487-.984.3258-1.3542-.0443L12.6587 18.074Z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>ACE Tutor</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>History · WW2 Essay</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(94,210,140,0.7)" }} />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>Active</span>
          </div>
        </div>

        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", gap: 10, flexDirection: msg.from === "student" ? "row-reverse" : "row" }}>
              {msg.from === "ace" && (
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(94,106,210,0.15)", border: "1px solid rgba(94,106,210,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <svg width="10" height="10" viewBox="0 0 100 100" fill="rgba(94,106,210,0.8)">
                    <path d="M1.22541 61.5228c-.2225-.9485.90748-1.5459 1.59638-.857L39.3342 97.1782c.6889.6889.0915 1.8189-.857 1.5964C20.0515 94.4522 5.54779 79.9485 1.22541 61.5228ZM.00189 46.8891c-.0176.2833.0889.5599.2896.7606L52.3503 99.7085c.2007.2007.4773.3075.7606.2896 2.3692-.1476 4.6938-.46 6.9624-.9259.7645-.157 1.0301-1.0963.4782-1.6481L2.576 39.4485c-.5519-.5519-1.4912-.2863-1.6482.4782-.4659 2.2686-.7783 4.5932-.9259 6.9624ZM4.21093 29.7054c-.16649.3738-.08169.8106.20765 1.1l64.77602 64.776c.2894.2894.7262.3742 1.1.2077 1.7861-.7956 3.5171-1.6927 5.1855-2.684.5521-.328.6373-1.0867.1832-1.5407L8.43566 24.3367c-.45409-.4541-1.21271-.3689-1.54074.1832-.99132 1.6684-1.88843 3.3994-2.68399 5.1855ZM12.6587 18.074c-.3701-.3701-.393-.9637-.0443-1.3541C21.7795 6.45931 35.1114 0 49.9519 0 77.5927 0 100 22.4073 100 50.0481c0 14.8405-6.4593 28.1724-16.7199 37.3375-.3903.3487-.984.3258-1.3542-.0443L12.6587 18.074Z" />
                  </svg>
                </div>
              )}
              <div
                style={{
                  maxWidth: "78%",
                  padding: "9px 12px",
                  borderRadius: msg.from === "student" ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                  background: msg.from === "student" ? "rgba(94,106,210,0.15)" : "rgba(255,255,255,0.04)",
                  border: msg.from === "student" ? "1px solid rgba(94,106,210,0.2)" : "1px solid rgba(255,255,255,0.06)",
                  fontSize: 12,
                  color: msg.from === "student" ? "rgba(200,205,255,0.9)" : "rgba(255,255,255,0.55)",
                  lineHeight: 1.6,
                }}
              >
                {msg.text}
                {msg.thinking && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 10, color: "rgba(94,106,210,0.7)", background: "rgba(94,106,210,0.1)", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 4, padding: "2px 6px" }}>Diagram</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "2px 6px" }}>Quiz me</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "2px 6px" }}>Simplify</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "#0a0b0d", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", padding: "0 12px" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>Ask ACE anything...</span>
          </div>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(94,106,210,0.8)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "default" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9l20-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          padding: "12px 16px",
          background: "#0f1012",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(94,106,210,0.6)", flexShrink: 0 }} />
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>
          ACE remembers: <span style={{ color: "rgba(255,255,255,0.5)" }}>Marcus submitted his history essay on Oct 2nd. Mr. Rivera graded it Oct 14th with feedback on economic analysis. Tracking revision since.</span>
        </div>
      </div>
    </div>
  );
}

const features = [
  { title: "Personal AI Tutor", desc: "Every student gets an AI tutor that knows their history, pace, and preferred style." },
  { title: "Longitudinal Memory", desc: "ACE remembers what each student has learned, struggled with, and mastered." },
  { title: "Instant Feedback", desc: "Get detailed feedback on any assignment before submitting." },
  { title: "ACE Spaces", desc: "Interactive study environments for exploration and practice." },
  { title: "Smart Study Plans", desc: "Tailored study plans based on upcoming tests and learning gaps." },
  { title: "Knowledge Checks", desc: "Quick checks after lessons to surface gaps before they compound." },
];

export function ForStudents() {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [expanded, setExpanded] = React.useState(false);

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
            For students
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--color-text-primary)", lineHeight: 1.1, margin: "0 0 16px", maxWidth: 520 }}>
            Every student gets a dedicated AI tutor.
          </h2>
          <p style={{ fontSize: 15, color: "var(--color-text-tertiary)", lineHeight: 1.65, margin: 0, maxWidth: 440 }}>
            ACE learns each student&apos;s unique strengths and gaps — then adapts every explanation in real time.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }} className="md:grid-cols-2 grid-cols-1">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <TutorPanel />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
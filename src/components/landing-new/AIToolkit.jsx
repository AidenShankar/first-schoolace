import React from "react";
import { motion, useInView } from "framer-motion";

const tools = [
  "AI Essay Grader", "Assessment Builder", "Assignment Builder", "Rubric Creator",
  "Progress Reports", "Parent Updates", "Study Planner", "Flashcard Generator",
  "Lesson Summarizer", "Citation Checker", "Vocabulary Builder", "Math Solver",
  "Science Explainer", "History Analyzer", "Writing Coach", "Reading Tutor",
  "Test Prep Engine", "Concept Mapper", "Discussion Prompts", "ACE AI Agent",
];

const INITIAL_COUNT = 8;

export function AIToolkit() {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [expanded, setExpanded] = React.useState(false);

  const visible = expanded ? tools : tools.slice(0, INITIAL_COUNT);
  const remaining = tools.length - INITIAL_COUNT;

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
            AI toolkit
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--color-text-primary)", lineHeight: 1.1, margin: "0 0 16px" }}>
            30+ AI tools, built-in.
          </h2>
          <p style={{ fontSize: 15, color: "var(--color-text-tertiary)", lineHeight: 1.65, margin: 0, maxWidth: 480 }}>
            Everything from automated grading to interactive tutoring — one integrated platform, not a patchwork of tools.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
        >
          {visible.map((tool) => (
            <span
              key={tool}
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 28,
                padding: "0 12px",
                fontSize: 12,
                fontWeight: 400,
                color: "var(--color-text-secondary)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6,
                background: "rgba(255,255,255,0.02)",
                letterSpacing: "-0.005em",
                transition: "border-color 150ms, color 150ms, background 150ms",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(94,106,210,0.4)";
                e.currentTarget.style.color = "var(--color-text-primary)";
                e.currentTarget.style.background = "rgba(94,106,210,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "var(--color-text-secondary)";
                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
              }}
            >
              {tool}
            </span>
          ))}
          {!expanded && (
            <button
              onClick={() => setExpanded(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 28,
                padding: "0 12px",
                fontSize: 12,
                color: "rgba(94,106,210,0.8)",
                border: "1px solid rgba(94,106,210,0.25)",
                borderRadius: 6,
                background: "rgba(94,106,210,0.06)",
                letterSpacing: "-0.005em",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "border-color 150ms, background 150ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(94,106,210,0.5)";
                e.currentTarget.style.background = "rgba(94,106,210,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(94,106,210,0.25)";
                e.currentTarget.style.background = "rgba(94,106,210,0.06)";
              }}
            >
              + {remaining} more
            </button>
          )}
        </motion.div>
      </div>
    </section>
  );
}
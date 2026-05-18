import React from "react";
import { motion, useInView } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For individual teachers getting started.",
    features: ["1 class", "Up to 10 students", "Basic AI grading", "Standard assignments", "Email support"],
    cta: "Start for free",
    href: "#",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$10",
    period: "per student / month",
    description: "For teachers who want the full AI experience.",
    features: ["Unlimited classes", "Unlimited students", "Advanced AI grading", "Personal AI tutors", "ACE AI agent", "Real-time analytics", "Priority support"],
    cta: "Get started",
    href: "#",
    highlight: true,
  },
  {
    name: "School",
    price: "Custom",
    period: "pricing",
    description: "For entire schools and districts.",
    features: ["Everything in Pro", "Dedicated account manager", "Custom integrations", "Teacher training", "SLA & dedicated support", "SSO / SAML"],
    cta: "Contact sales",
    href: "#contact",
    highlight: false,
  },
];

export function Pricing({ onContactOpen, signinUrl = "/newai" }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} id="pricing" style={{ padding: "0 24px 96px", maxWidth: 1120, margin: "0 auto" }}>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 80 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 48 }}
        >
          <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-accent)", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 14px" }}>
            Pricing
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--color-text-primary)", lineHeight: 1.1, margin: 0 }}>
            Simple, transparent pricing.
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{
                padding: "28px 24px",
                borderRadius: 10,
                border: plan.highlight
                  ? "1px solid rgba(94,106,210,0.35)"
                  : "1px solid rgba(255,255,255,0.07)",
                background: plan.highlight
                  ? "rgba(94,106,210,0.06)"
                  : "rgba(255,255,255,0.015)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {plan.highlight && (
                <div style={{ position: "absolute", top: -1, left: 24, right: 24, height: 1, background: "rgba(94,106,210,0.6)" }} />
              )}

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: plan.highlight ? "var(--color-accent)" : "var(--color-text-tertiary)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 10 }}>
                  {plan.name}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.04em", color: "var(--color-text-primary)" }}>{plan.price}</span>
                  <span style={{ fontSize: 12, color: "var(--color-text-quaternary)" }}>{plan.period}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--color-text-tertiary)", lineHeight: 1.5 }}>{plan.description}</div>
              </div>

              {plan.name === "School" ? (
                <button
                  onClick={onContactOpen}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 34,
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 24,
                    transition: "background 150ms, border-color 150ms",
                    background: "transparent",
                    color: "var(--color-text-secondary)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "var(--color-text-primary)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "var(--color-text-secondary)"; }}
                >
                  {plan.cta}
                </button>
              ) : (
                <a
                  href={signinUrl}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 34,
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: "none",
                    marginBottom: 24,
                    transition: "background 150ms, border-color 150ms",
                    background: plan.highlight ? "rgba(255,255,255,0.92)" : "transparent",
                    color: plan.highlight ? "#08090a" : "var(--color-text-secondary)",
                    border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.1)",
                  }}
                  onMouseEnter={(e) => {
                    if (plan.highlight) e.currentTarget.style.background = "#ffffff";
                    else { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "var(--color-text-primary)"; }
                  }}
                  onMouseLeave={(e) => {
                    if (plan.highlight) e.currentTarget.style.background = "rgba(255,255,255,0.92)";
                    else { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "var(--color-text-secondary)"; }
                  }}
                >
                  {plan.cta}
                </a>
              )}

              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--color-text-tertiary)" }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: plan.highlight ? "var(--color-accent)" : "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
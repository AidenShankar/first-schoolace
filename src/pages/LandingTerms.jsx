import React from "react";
import { Link } from "react-router-dom";

const LOGO = "https://media.base44.com/images/public/687ed6bea54c832b17eb40bc/71eba0ef1_schoolacenewlogo.png";

const prose = {
  h2: { fontSize: 18, fontWeight: 600, color: "rgba(255,255,255,0.88)", margin: "32px 0 10px", letterSpacing: "-0.01em" },
  p: { fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, margin: "0 0 12px" },
  ul: { fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, paddingLeft: 20, margin: "0 0 12px" },
  li: { marginBottom: 6 },
};

export default function LandingTerms() {
  return (
    <div style={{ minHeight: "100vh", background: "#08090a", color: "rgba(255,255,255,0.88)", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(8,9,10,0.88)", backdropFilter: "blur(12px)", padding: "0 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <img src={LOGO} alt="SchoolACE" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />
            <span style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.88)", letterSpacing: "-0.01em" }}>SchoolACE</span>
          </Link>
          <Link to="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 150ms" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}>
            ← Back to home
          </Link>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px 96px" }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", color: "rgba(255,255,255,0.92)", margin: "0 0 8px" }}>Terms of Service</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", margin: 0 }}>Effective: September 1, 2025 &nbsp;|&nbsp; Updated: October 12, 2025</p>
        </div>

        <div style={{ padding: "16px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, marginBottom: 40 }}>
          <p style={{ ...prose.p, margin: 0, fontStyle: "italic" }}>
            <strong style={{ color: "rgba(255,255,255,0.6)" }}>Short version:</strong> use SchoolACE responsibly, keep your account secure, only upload content you have the right to use, and understand that AI features can make mistakes. You keep ownership of your content. We get a limited right to use it to run and improve the service. We do not sell personal information and do not use identifiable personal information to train third-party AI models.
          </p>
        </div>

        <p style={prose.p}>These Terms of Service govern your access to and use of the websites, applications, and related services provided by SchoolACE LLC ("SchoolACE," "we," "us," or "our"). By accessing or using SchoolACE, you agree to these Terms. If you use SchoolACE on behalf of a school, district, company, or other organization, you represent that you are authorized to accept these Terms on its behalf.</p>

        <h2 style={prose.h2}>1. Who Can Use SchoolACE</h2>
        <p style={prose.p}>You may use SchoolACE only if you can lawfully enter into these Terms and your use complies with applicable law and any school, district, or organizational rules that apply to your account.</p>
        <p style={prose.p}>Use of SchoolACE by minors may require consent or authorization from a parent, guardian, school, or other authorized adult, depending on the circumstances and applicable law.</p>
        <p style={prose.p}>If you are using SchoolACE through a school, parent, teacher, or other organization, your access may be created, managed, or removed by that party.</p>

        <h2 style={prose.h2}>2. Accounts</h2>
        <ul style={prose.ul}>
          <li style={prose.li}>You are responsible for keeping your account credentials secure.</li>
          <li style={prose.li}>You agree to provide reasonably accurate information for your account.</li>
          <li style={prose.li}>You are responsible for activity that occurs under your account, except to the extent caused by our own actions.</li>
          <li style={prose.li}>We may suspend or restrict accounts to protect users, enforce these Terms, or maintain the platform.</li>
        </ul>

        <h2 style={prose.h2}>3. Your Content</h2>
        <p style={prose.p}>You retain ownership of the content you submit to SchoolACE, including prompts, assignments, submissions, uploaded files, messages, and feedback ("Your Content").</p>
        <p style={prose.p}>You grant SchoolACE a limited, non-exclusive, worldwide, royalty-free license to host, store, reproduce, modify as needed for formatting or technical purposes, display, transmit, and process Your Content to:</p>
        <ul style={prose.ul}>
          <li style={prose.li}>provide, operate, and support the service;</li>
          <li style={prose.li}>deliver AI, grading, tutoring, and related product features;</li>
          <li style={prose.li}>maintain security, prevent abuse, and debug issues;</li>
          <li style={prose.li}>comply with law and enforce our policies;</li>
          <li style={prose.li}>create and use de-identified, aggregated, or non-identifiable information to improve and develop SchoolACE.</li>
        </ul>
        <p style={prose.p}>This license ends when Your Content is deleted from the service, except to the extent content has been shared with authorized users, retained in backups or archives for a limited period, or retained as required for legal, security, operational, or compliance reasons.</p>
        <p style={prose.p}>SchoolACE may access, process, and use Your Content and related account, usage, and technical information as reasonably necessary to operate, administer, support, secure, audit, maintain, and improve SchoolACE; verify that features and services work as intended; maintain compliance with applicable laws, school requirements, and platform guidelines; prevent misuse; investigate safety, security, or technical issues; respond to support requests; and enforce these Terms and our policies.</p>

        <h2 style={prose.h2}>4. Privacy and Data Use</h2>
        <p style={prose.p}>Your use of SchoolACE is also subject to our Privacy Policy.</p>
        <ul style={prose.ul}>
          <li style={prose.li}>We do not sell personal information.</li>
          <li style={prose.li}>We do not use identifiable personal information to train third-party AI models.</li>
          <li style={prose.li}>When we use third-party providers, we generally seek to limit the personal information shared with them to what is reasonably necessary for them to perform services for us.</li>
          <li style={prose.li}>We may use de-identified, aggregated, or otherwise non-identifiable information to operate, analyze, improve, and develop the service, including AI features.</li>
          <li style={prose.li}>We use third-party providers to host, store, process, support, analyze, and help power SchoolACE.</li>
        </ul>

        <h2 style={prose.h2}>5. Acceptable Use</h2>
        <p style={prose.p}>You agree not to:</p>
        <ul style={prose.ul}>
          <li style={prose.li}>use SchoolACE in violation of law or another person's rights;</li>
          <li style={prose.li}>upload content you do not have the right to use or share;</li>
          <li style={prose.li}>attempt to gain unauthorized access to the platform or other users' accounts;</li>
          <li style={prose.li}>interfere with the security, integrity, or operation of the service;</li>
          <li style={prose.li}>use SchoolACE to harass, abuse, threaten, or harm others;</li>
          <li style={prose.li}>use the service to send spam, malware, or fraudulent content;</li>
          <li style={prose.li}>scrape, reverse engineer, or misuse the service except as allowed by law;</li>
          <li style={prose.li}>use outputs from SchoolACE as a substitute for human judgment where meaningful review is required.</li>
        </ul>

        <h2 style={prose.h2}>6. AI Features</h2>
        <p style={prose.p}>SchoolACE may provide tutoring, grading, summarization, recommendations, or other AI-assisted features. These features are offered to help users, but they can be incomplete, inaccurate, or inappropriate in some cases.</p>
        <ul style={prose.ul}>
          <li style={prose.li}>You are responsible for reviewing outputs before relying on them.</li>
          <li style={prose.li}>Teachers, schools, parents, and other responsible adults remain responsible for academic, educational, and student-related decisions.</li>
          <li style={prose.li}>We may change, improve, limit, or discontinue AI features at any time.</li>
        </ul>

        <h2 style={prose.h2}>7. Paid Features</h2>
        <p style={prose.p}>Some parts of SchoolACE may require payment. If you purchase a paid plan:</p>
        <ul style={prose.ul}>
          <li style={prose.li}>you agree to pay applicable fees and taxes;</li>
          <li style={prose.li}>pricing, features, and billing terms may change from time to time;</li>
          <li style={prose.li}>payments may be processed by third-party payment providers;</li>
          <li style={prose.li}>unless otherwise stated, fees are non-refundable except where required by law.</li>
        </ul>

        <h2 style={prose.h2}>8. Third-Party Services</h2>
        <p style={prose.p}>SchoolACE may integrate with or depend on third-party services such as hosting providers, payment processors, authentication providers, communications tools, analytics tools, and AI providers. We are not responsible for third-party products, services, or policies. If you connect a Google account, our use of Google data adheres to the Google API Services User Data Policy, including the Limited Use requirements.</p>

        <h2 style={prose.h2}>9. Suspension and Termination</h2>
        <p style={prose.p}>You may stop using SchoolACE at any time. We may suspend, limit, or terminate access if we believe it is reasonably necessary to protect the platform, protect users, comply with law, enforce these Terms, or address misuse, fraud, non-payment, or security issues.</p>
        <p style={prose.p}>After termination, some provisions of these Terms will continue to apply, including provisions relating to intellectual property, payment obligations, disclaimers, limitations of liability, and any rights to retain de-identified, aggregated, or lawfully retained data.</p>

        <h2 style={prose.h2}>10. Disclaimers</h2>
        <p style={prose.p}>SchoolACE is provided on an "as is" and "as available" basis. To the maximum extent permitted by law, we disclaim all warranties, whether express, implied, or statutory, including implied warranties of merchantability, fitness for a particular purpose, non-infringement, and any warranty that the service will be uninterrupted, error-free, or fully secure.</p>

        <h2 style={prose.h2}>11. Limitation of Liability</h2>
        <p style={prose.p}>To the maximum extent permitted by law, SchoolACE and its affiliates, officers, employees, and service providers will not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or for any loss of profits, revenues, goodwill, data, or business opportunities arising out of or related to your use of the service.</p>
        <p style={prose.p}>To the maximum extent permitted by law, our total liability for claims arising out of or related to the service will not exceed the greater of (a) the amount you paid to SchoolACE for the service in the 12 months before the claim arose or (b) $100.</p>

        <h2 style={prose.h2}>12. Disputes and Governing Law</h2>
        <p style={prose.p}>If you have a dispute or concern with SchoolACE, you agree to contact us first at contact@schoolace.ai so we can try to resolve it informally.</p>
        <p style={prose.p}>These Terms are governed by the laws of the State of California, without regard to conflict of laws principles. To the extent permitted by law, any dispute that cannot be resolved informally will be brought exclusively in the state or federal courts located in California, and each party consents to personal jurisdiction and venue there. Either party may still bring an eligible claim in small claims court or seek injunctive relief where appropriate.</p>

        <h2 style={prose.h2}>13. Changes to These Terms</h2>
        <p style={prose.p}>We may update these Terms from time to time. If we make material changes, we may provide notice by updating this page, posting a notice in the product, or using other reasonable means. By continuing to use SchoolACE after the updated Terms take effect, you agree to the revised Terms.</p>

        <h2 style={prose.h2}>14. General</h2>
        <p style={prose.p}>If any provision is found unenforceable, the remaining provisions will remain in effect. These Terms, together with any applicable order forms or separate written agreements and our Privacy Policy, form the agreement between you and SchoolACE regarding the service.</p>

        <h2 style={prose.h2}>15. Contact</h2>
        <p style={prose.p}>If you have questions about these Terms, contact us at <a href="mailto:contact@schoolace.ai" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "underline" }}>contact@schoolace.ai</a>.</p>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.07)", fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
          © 2026 SchoolACE LLC. All rights reserved.
        </div>
      </div>
    </div>
  );
}
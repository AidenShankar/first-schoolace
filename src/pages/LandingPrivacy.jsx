import React from "react";
import { Link } from "react-router-dom";

const LOGO = "https://media.base44.com/images/public/687ed6bea54c832b17eb40bc/71eba0ef1_schoolacenewlogo.png";

const prose = {
  h2: { fontSize: 18, fontWeight: 600, color: "rgba(255,255,255,0.88)", margin: "32px 0 10px", letterSpacing: "-0.01em" },
  p: { fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, margin: "0 0 12px" },
  ul: { fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, paddingLeft: 20, margin: "0 0 12px" },
  li: { marginBottom: 6 },
};

export default function LandingPrivacy() {
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
          <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", color: "rgba(255,255,255,0.92)", margin: "0 0 8px" }}>Privacy Policy</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", margin: 0 }}>Effective: September 1, 2025 &nbsp;|&nbsp; Updated: October 12, 2025</p>
        </div>

        <div style={{ padding: "16px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, marginBottom: 40 }}>
          <p style={{ ...prose.p, margin: 0, fontStyle: "italic" }}>
            <strong style={{ color: "rgba(255,255,255,0.6)" }}>Short version:</strong> your personal information and content stay yours. We use data to run SchoolACE, support users, protect the platform, and improve our products. We do not sell personal information. We may use de-identified, aggregated, or otherwise non-identifiable data to improve the platform, analytics, safety systems, and AI features.
          </p>
        </div>

        <p style={prose.p}>This Privacy Policy explains how SchoolACE LLC ("SchoolACE," "we," "our," or "us") collects, uses, stores, and discloses information when you use our websites, applications, and related services. This policy is part of our Terms of Service. If you use SchoolACE through a school, district, teacher, or other organization, that organization may also have its own rules for your account and data.</p>

        <h2 style={prose.h2}>1. What We Collect</h2>
        <p style={prose.p}>We collect information you provide directly, information created through use of the service, and certain technical information needed to operate the platform.</p>
        <ul style={prose.ul}>
          <li style={prose.li}><strong style={{ color: "rgba(255,255,255,0.65)" }}>Account information:</strong> such as name, email address, role, school, and account preferences.</li>
          <li style={prose.li}><strong style={{ color: "rgba(255,255,255,0.65)" }}>User content:</strong> such as assignments, submissions, messages, uploaded files, prompts, feedback, grades, and other content you choose to provide.</li>
          <li style={prose.li}><strong style={{ color: "rgba(255,255,255,0.65)" }}>Usage information:</strong> such as pages visited, features used, actions taken, and approximate timestamps.</li>
          <li style={prose.li}><strong style={{ color: "rgba(255,255,255,0.65)" }}>Device and technical information:</strong> such as browser type, device type, IP address, and log data.</li>
          <li style={prose.li}><strong style={{ color: "rgba(255,255,255,0.65)" }}>Payment information:</strong> if you purchase a paid plan, payment card processing is handled by our payment providers. We generally do not store full payment card numbers ourselves.</li>
        </ul>

        <h2 style={prose.h2}>2. How We Use Information</h2>
        <p style={prose.p}>We use information for legitimate business and educational purposes, including to:</p>
        <ul style={prose.ul}>
          <li style={prose.li}>provide, maintain, and improve SchoolACE;</li>
          <li style={prose.li}>create and manage accounts;</li>
          <li style={prose.li}>deliver tutoring, grading, feedback, and other AI-powered features;</li>
          <li style={prose.li}>respond to support requests and communicate with users;</li>
          <li style={prose.li}>monitor usage, debug issues, and protect the platform;</li>
          <li style={prose.li}>prevent fraud, abuse, and security incidents;</li>
          <li style={prose.li}>comply with legal obligations and enforce our terms.</li>
        </ul>
        <p style={prose.p}>SchoolACE may access, process, and use account information, user content, submissions, messages, usage activity, logs, and related data as reasonably necessary to operate, administer, support, secure, audit, maintain, and improve SchoolACE; verify that features and services work as intended; maintain compliance with applicable laws, school requirements, and platform guidelines; prevent misuse; investigate safety, security, or technical issues; respond to support requests; and enforce our terms and policies.</p>
        <p style={prose.p}>Access to identifiable user or student information is limited to authorized SchoolACE personnel, designated staff, service providers, and authorized school users who need access for these purposes. Where practical, SchoolACE uses aggregated, de-identified, or otherwise non-identifiable information for broader analytics, reporting, product development, and service improvement.</p>

        <h2 style={prose.h2}>3. Ownership and Control</h2>
        <p style={prose.p}>Your data is yours. As between you and SchoolACE, you retain ownership of your personal information and the content you submit to the platform.</p>
        <p style={prose.p}>You give us a limited right to host, store, reproduce, display, transmit, and process your information and content as needed to operate the service, support your use of it, secure the platform, and improve it in the ways described in this policy.</p>
        <p style={prose.p}>If your account is managed by a school, district, teacher, parent, or other organization, that organization may have certain rights to access, manage, or request deletion of data associated with the account, subject to applicable law and contract terms.</p>

        <h2 style={prose.h2}>4. AI, Analytics, and De-identified Data</h2>
        <p style={prose.p}>We use AI and automation to provide parts of the SchoolACE experience.</p>
        <ul style={prose.ul}>
          <li style={prose.li}>We do not use identifiable personal information to train third-party AI models.</li>
          <li style={prose.li}>When we use third-party providers, we generally seek to limit the personal information shared with them to what is reasonably necessary for them to perform services for us.</li>
          <li style={prose.li}>We may use de-identified, aggregated, or otherwise non-identifiable data to improve, analyze, develop, test, and operate SchoolACE, including our AI features, analytics, safety systems, and product performance.</li>
          <li style={prose.li}>We may create statistics, benchmarks, product insights, and similar learnings from platform usage so long as they do not reasonably identify a specific person.</li>
          <li style={prose.li}>In some cases, stricter rules may apply to certain data sources, integrations, contracts, or legal regimes. Where that happens, those stricter rules control.</li>
        </ul>

        <h2 style={prose.h2}>5. When We Share Information</h2>
        <p style={prose.p}>We do not sell personal information. We do not share personal information for advertising or other third parties' own marketing purposes.</p>
        <p style={prose.p}>We may disclose information in the following limited situations:</p>
        <ul style={prose.ul}>
          <li style={prose.li}><strong style={{ color: "rgba(255,255,255,0.65)" }}>With service providers:</strong> We use vendors and infrastructure providers to help operate SchoolACE, such as hosting, storage, analytics, communications, payments, support, and AI services.</li>
          <li style={prose.li}><strong style={{ color: "rgba(255,255,255,0.65)" }}>Within the service:</strong> We may share information with teachers, students, parents, school personnel, or other authorized users as part of providing the platform.</li>
          <li style={prose.li}><strong style={{ color: "rgba(255,255,255,0.65)" }}>For legal or safety reasons:</strong> We may disclose information if we believe it is reasonably necessary to comply with law, protect rights or safety, investigate misuse, or enforce our terms.</li>
          <li style={prose.li}><strong style={{ color: "rgba(255,255,255,0.65)" }}>As part of a business transaction:</strong> We may disclose information in connection with a financing, merger, acquisition, reorganization, sale of assets, or similar transaction, subject to customary protections.</li>
        </ul>

        <h2 style={prose.h2}>6. Third-Party Providers</h2>
        <p style={prose.p}>Like most software companies, we rely on third-party providers to run our services. These providers may process information on our behalf as part of delivering infrastructure, storage, authentication, AI, communications, analytics, customer support, and payment functionality.</p>
        <p style={prose.p}>We generally seek to limit the personal information shared with providers to what is reasonably necessary for them to perform services for us. We do not authorize service providers to use personal information for their own advertising or unrelated purposes.</p>

        <h2 style={prose.h2}>7. Google API Services</h2>
        <p style={prose.p}>If you sign in with Google or connect a Google account, SchoolACE's use of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements. We only access Google data necessary to provide the features you have enabled, and we do not use Google user data for advertising or model training.</p>

        <h2 style={prose.h2}>8. Data Retention and Deletion</h2>
        <p style={prose.p}>We keep information for as long as reasonably necessary to provide the service, maintain business records, resolve disputes, protect the platform, enforce agreements, comply with law, and support legitimate operational needs.</p>
        <ul style={prose.ul}>
          <li style={prose.li}>You may request deletion of your account or certain data by contacting us or using available account tools.</li>
          <li style={prose.li}>Deletion may not be immediate in all systems.</li>
          <li style={prose.li}>Copies may remain in backups, logs, archives, or internal systems for a limited period.</li>
          <li style={prose.li}>We may retain information as required or permitted by law, for security and fraud prevention, for recordkeeping, or for other legitimate business purposes.</li>
          <li style={prose.li}>We may continue to retain de-identified, aggregated, or otherwise non-identifiable information that does not reasonably identify you.</li>
        </ul>

        <h2 style={prose.h2}>9. Security</h2>
        <p style={prose.p}>We use reasonable administrative, technical, and organizational measures designed to protect information. No system is completely secure, and we cannot guarantee absolute security. In the event of a data breach involving personal information, we will notify affected users and relevant authorities in accordance with applicable law.</p>

        <h2 style={prose.h2}>10. Children, School Accounts, and Education Privacy</h2>
        <p style={prose.p}>SchoolACE may be used by students through schools, educators, parents, or other authorized adults. If a school or other organization provides your access to SchoolACE, that organization may control account setup, permissions, and certain data decisions.</p>
        <p style={prose.p}>SchoolACE is designed to comply with applicable education and children's privacy laws, including FERPA and COPPA. Where SchoolACE processes student education records on behalf of a school, we act as a school official with a legitimate educational interest under FERPA. For children under 13, we rely on school or parental consent as required by COPPA.</p>

        <h2 style={prose.h2}>11. Your Choices</h2>
        <p style={prose.p}>Depending on how you use SchoolACE and where you live, you may be able to access, update, or request deletion of certain information. Some requests may be limited by law, technical constraints, school relationships, or our need to protect other users and the platform.</p>

        <h2 style={prose.h2}>12. California Privacy Rights</h2>
        <p style={prose.p}>If you are a California resident, you may have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, request deletion, and opt out of the sale of personal information. We do not sell personal information. To exercise your rights, contact us at <a href="mailto:contact@schoolace.ai" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "underline" }}>contact@schoolace.ai</a>.</p>

        <h2 style={prose.h2}>13. Changes to This Policy</h2>
        <p style={prose.p}>We may update this Privacy Policy from time to time. If we make material changes, we may provide notice by updating this page, posting a notice in the product, or using other appropriate means. Your continued use of SchoolACE after an update means the updated policy will apply going forward.</p>

        <h2 style={prose.h2}>14. Contact</h2>
        <p style={prose.p}>If you have questions about this Privacy Policy or want to submit a data request, contact us at <a href="mailto:contact@schoolace.ai" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "underline" }}>contact@schoolace.ai</a>.</p>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.07)", fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
          © 2026 SchoolACE LLC. All rights reserved.
        </div>
      </div>
    </div>
  );
}
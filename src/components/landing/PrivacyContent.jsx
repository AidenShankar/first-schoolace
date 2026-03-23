import React from "react";

const specificDate = "September 1, 2025";
const lastUpdated = "October 12, 2025";

export default function PrivacyContent() {
  return (
    <div className="prose prose-slate max-w-none text-slate-700">
      <p className="text-sm text-slate-500 mb-6">
        <strong>Effective Date:</strong> {specificDate}<br />
        <strong>Last Updated:</strong> {lastUpdated}
      </p>
      <p>Schoolace ("we," "our," or "us") is committed to protecting the privacy of teachers, students, and all users of our platform. This Privacy Policy explains how we collect, use, store, and protect your information when you use our services.</p>

      <h2>1. Our Commitment to Student Privacy</h2>
      <p>Schoolace complies with FERPA (20 U.S.C. § 1232g; 34 CFR Part 99), COPPA (16 CFR § 312.5(c)(3)), and applicable state student privacy laws including California SOPIPA.</p>

      <h2>2. How Schoolace Operates</h2>
      <ul>
        <li><strong>School-Based Model:</strong> Schoolace provides services directly to schools and teachers.</li>
        <li><strong>Data Processor Role:</strong> Schools retain full ownership and control of all student education records.</li>
        <li><strong>Educational Purpose Only:</strong> All student data is used exclusively to provide educational services authorized by schools.</li>
      </ul>

      <h2>3. Information We Collect</h2>
      <p><strong>From Schools and Teachers:</strong> Teacher account details, student information (names, emails if provided), educational content, academic performance data, and platform communications.</p>
      <p><strong>Payment Information (Schools/Teachers Only):</strong> Billing info processed securely by Stripe. Not linked to student records.</p>
      <p><strong>Technical Information:</strong> IP address, browser type, device identifiers, usage logs, and error logs.</p>
      <p><strong>What We Do NOT Collect:</strong> SSNs, student financial info, health/medical info, biometric data, or precise geolocation.</p>

      <h2>4. How We Use Information</h2>
      <p>Primarily to provide classroom management tools, AI-assisted content generation, automated grading, progress tracking, and teacher-student communication within the educational context.</p>

      <h2>5. What We Do NOT Do With Your Data</h2>
      <ul>
        <li>We will never sell or rent student data to any third party.</li>
        <li>We do not use student data for targeted advertising or marketing.</li>
        <li>We do not build student profiles for non-educational purposes.</li>
        <li>We do not provide student data to external third parties for AI model training.</li>
      </ul>

      <h2>6. AI and Machine Learning</h2>
      <p>Our AI models may learn from student interactions solely to improve the educational experience for that specific student within their school context. All AI processing occurs to provide and improve educational services requested by teachers and schools.</p>

      <h2>7. Data Sharing</h2>
      <p>We use US-based cloud service providers under data protection agreements. We may disclose information with school authorization, for legal requirements, for safety, or in business transfers (schools notified first).</p>

      <h2>8. Data Storage and Security</h2>
      <p>All data is stored in the United States. We use TLS 1.2+ encryption in transit, AES-256 at rest, MFA, least-privilege access, and periodic security assessments. In case of a breach, we will immediately notify affected schools.</p>

      <h2>9. Data Retention and Deletion</h2>
      <p>Student data is retained only for the minimum period necessary. Schools may request deletion at any time via <a href="mailto:contact@schoolace.org">contact@schoolace.org</a>. Deleted accounts are removed within 30 days; backups within 90 days.</p>

      <h2>10. Parental Rights Under FERPA</h2>
      <p>Parents may inspect, review, and request amendments to their child's education records through the school. All parental rights requests should be directed to the school, not to Schoolace directly.</p>

      <h2>11. Children's Privacy (COPPA)</h2>
      <p>We collect student information only through schools. Schools are responsible for obtaining verifiable parental consent for students under 13.</p>

      <h2>12. Cookies</h2>
      <p>We use cookies for authentication, session management, security, and aggregate performance analytics only. We do not use cookies for behavioral advertising or cross-site tracking.</p>

      <h2>13. Contact Information</h2>
      <p><strong>General Privacy Questions:</strong> <a href="mailto:contact@schoolace.org">contact@schoolace.org</a></p>
      <p><strong>Data Protection Officer:</strong> Schoolace Administrator</p>
      <p><strong>FERPA Concerns:</strong> Contact your school directly.</p>

      <hr />
      <p><strong>By using Schoolace, you acknowledge that you have read, understood, and agree to this Privacy Policy.</strong></p>
    </div>
  );
}
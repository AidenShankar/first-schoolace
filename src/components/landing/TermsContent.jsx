import React from "react";

const specificDate = "September 1, 2025";
const lastUpdated = "October 12, 2025";

export default function TermsContent() {
  return (
    <div className="prose prose-slate max-w-none text-slate-700">
      <p className="text-sm text-slate-500 mb-6">
        <strong>Effective Date:</strong> {specificDate}<br />
        <strong>Last Updated:</strong> {lastUpdated}
      </p>
      <p>Welcome to SchoolAce, an all-in-one, AI-powered education platform that streamlines classroom management and enhances student learning. These Terms of Service ("Terms") govern your access to and use of SchoolAce ("Service" or "Platform"). By creating an account, accessing, or using the Service, you agree to be bound by these Terms. If you do not agree, do not use SchoolAce.</p>
      <h2>1. Eligibility and School Authorization</h2>
      <ul>
        <li><strong>Teachers and School Staff:</strong> You must be at least 18 years old and authorized by your school or educational institution to use SchoolAce on behalf of students.</li>
        <li><strong>Students:</strong> Student access must be authorized by the school. Students under 18 may only use the Platform under school supervision and with appropriate parental consent obtained by the school.</li>
        <li><strong>School Authorization Model:</strong> SchoolAce operates under school authorization. Schools are responsible for obtaining necessary parental consents and ensuring compliance with applicable laws.</li>
        <li>You are responsible for ensuring your use complies with all applicable laws, regulations, and school policies.</li>
      </ul>
      <h2>2. Accounts and Security</h2>
      <ul>
        <li>You must provide accurate and complete information when creating an account.</li>
        <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
        <li>Multi-factor authentication (MFA) may be required for enhanced security.</li>
        <li>You must immediately notify us at <a href="mailto:contact@schoolace.org">contact@schoolace.org</a> of any unauthorized access to your account.</li>
        <li>SchoolAce is not liable for loss or damage arising from your failure to secure your account.</li>
        <li>Access to student information is restricted to authorized school personnel with legitimate educational interests only.</li>
      </ul>
      <h2>3. Acceptable Use</h2>
      <p>When using SchoolAce, you agree not to:</p>
      <ol>
        <li>Use the Service for unlawful purposes or to promote illegal activities.</li>
        <li>Post or transmit any content that is harmful, harassing, defamatory, obscene, or otherwise inappropriate.</li>
        <li>Attempt to access, modify, or disrupt any part of the Platform without authorization.</li>
        <li>Upload malicious code, viruses, or any harmful software.</li>
        <li>Misuse AI-generated content to mislead, harass, or impersonate others.</li>
        <li>Access or attempt to access student data for which you do not have proper authorization.</li>
        <li>Use student data for any purpose other than providing educational services authorized by the school.</li>
      </ol>
      <h2>4. Data Ownership and School Rights</h2>
      <ul>
        <li><strong>School Data Ownership:</strong> Schools retain full ownership and control over all student education records and data. SchoolAce acts solely as a service provider processing data on behalf of schools.</li>
        <li><strong>Your Content:</strong> You retain ownership of all educational materials, assignments, and other content you upload. You grant SchoolAce a non-exclusive, worldwide license to host, store, and process your content solely to provide the Service.</li>
        <li><strong>Student Data:</strong> All student data is owned by the school and is used exclusively for educational purposes. SchoolAce does not sell, rent, or share student data with third parties except as necessary to provide the Service.</li>
        <li><strong>AI-Generated Content:</strong> Any AI-generated content produced through the Platform is provided "as is" for educational purposes. You are responsible for reviewing and verifying AI outputs before using them with students.</li>
        <li><strong>Data Isolation:</strong> Student data from each school is kept completely separate. We do not aggregate or analyze data across schools.</li>
        <li><strong>SchoolAce Content:</strong> All branding, software, and proprietary tools remain the property of SchoolAce and are protected by intellectual property laws.</li>
      </ul>
      <h2>5. Privacy and Data Protection</h2>
      <ul>
        <li><strong>Privacy Policy:</strong> Our Privacy Policy explains in detail how we collect, use, and protect your data.</li>
        <li><strong>FERPA Compliance:</strong> SchoolAce complies with FERPA (20 U.S.C. § 1232g; 34 CFR Part 99).</li>
        <li><strong>COPPA Compliance:</strong> SchoolAce complies with COPPA under the school authorization exception.</li>
        <li><strong>Direct School Control:</strong> Schools maintain direct control over SchoolAce's use of education records through these Terms and may terminate access at any time.</li>
        <li><strong>Third-Party Service Providers:</strong> SchoolAce uses cloud service providers based in US to process the data.</li>
        <li><strong>Prohibited Uses:</strong> SchoolAce will NOT sell or rent student data, use student data for behavioral advertising, build student profiles for non-educational purposes, or share student data except as disclosed or required by law.</li>
        <li><strong>Data Location:</strong> All data is stored and processed within the United States.</li>
      </ul>
      <h2>6. Security Measures</h2>
      <ul>
        <li><strong>Encryption:</strong> All data is encrypted in transit using TLS 1.2+ and at rest using AES-256.</li>
        <li><strong>Access Controls:</strong> Strict authentication and least-privilege access controls are enforced.</li>
        <li><strong>Incident Response:</strong> In the event of a data security incident, we will immediately notify affected schools.</li>
      </ul>
      <h2>7. Data Retention and Deletion</h2>
      <ul>
        <li>Student data is retained only for the minimum period necessary to provide educational services.</li>
        <li>Schools may request correction or deletion of student information at any time by contacting <a href="mailto:contact@schoolace.org">contact@schoolace.org</a>.</li>
        <li>Upon contract termination, all student data will be securely deleted unless the school requests otherwise or retention is required by law.</li>
        <li>Schools may request export of their student data in a structured, usable format at any time.</li>
      </ul>
      <h2>8. Payments and Subscriptions</h2>
      <ul>
        <li>Schools or teachers pay a subscription fee for access to premium features.</li>
        <li>Payments are billed in advance and are non-refundable unless otherwise stated by law.</li>
        <li>We may change pricing with at least 30 days' notice to active subscribers.</li>
        <li>Payment processing is handled securely through Stripe and does not involve student educational data.</li>
      </ul>
      <h2>9. Termination</h2>
      <p>We may suspend or terminate your account if you violate these Terms, engage in unlawful activity, compromise platform security, or use student data for unauthorized purposes. Schools may terminate their use of SchoolAce at any time.</p>
      <h2>10. Governing Law</h2>
      <p>These Terms are governed by the laws of the State of California. Any disputes shall be resolved in the state or federal courts located in California.</p>
      <h2>11. Contact</h2>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:contact@schoolace.org">contact@schoolace.org</a></li>
        <li><strong>Privacy Officer:</strong> SchoolAce Administrator</li>
      </ul>
      <hr />
      <p><strong>By using SchoolAce, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</strong></p>
    </div>
  );
}
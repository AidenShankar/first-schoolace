import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Shield, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const specificDate = "September 1, 2025";
const lastUpdated = "October 12, 2025";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-purple-950 text-white">
      {/* Header - Landing Page Style */}
      <header className="py-6 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 backdrop-blur-sm bg-black/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to={createPageUrl('Landing')} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Schoolace</span>
          </Link>
          
          <Link to={createPageUrl('Landing')}>
            <Button variant="ghost" className="text-slate-300 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 md:p-12 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Privacy Policy
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                <strong>Effective:</strong> {specificDate} | <strong>Updated:</strong> {lastUpdated}
              </p>
            </div>
          </div>

          <div className="prose prose-invert prose-slate max-w-none">
            <style>{`
              .prose-invert h2 {
                color: #fff;
                font-size: 1.75rem;
                font-weight: 700;
                margin-top: 2.5rem;
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 2px solid rgba(99, 102, 241, 0.3);
              }
              .prose-invert h3 {
                color: #e2e8f0;
                font-size: 1.25rem;
                font-weight: 600;
                margin-top: 1.5rem;
                margin-bottom: 0.75rem;
              }
              .prose-invert p {
                color: #cbd5e1;
                line-height: 1.75;
                margin-bottom: 1rem;
              }
              .prose-invert ul, .prose-invert ol {
                color: #cbd5e1;
                margin: 1rem 0;
                padding-left: 1.5rem;
              }
              .prose-invert li {
                margin-bottom: 0.5rem;
              }
              .prose-invert strong {
                color: #a5b4fc;
                font-weight: 600;
              }
              .prose-invert a {
                color: #818cf8;
                text-decoration: underline;
              }
              .prose-invert a:hover {
                color: #a5b4fc;
              }
            `}</style>

            <p className="text-lg leading-relaxed">
              Welcome to Schoolace ("we," "our," or "us"). We are committed to protecting the privacy and security of our users, including students, teachers, and educational institutions. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>

            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6 my-8">
              <h3 className="text-lg font-semibold text-white mb-2">🔒 Google API Services Compliance</h3>
              <p className="text-sm text-slate-300">
                Schoolace's use of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">Google API Services User Data Policy</a>, including the Limited Use requirements.
              </p>
            </div>

            <h2>1. Information We Collect</h2>

            <h3>1.1 Information You Provide</h3>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, role (teacher/student)</li>
              <li><strong>Educational Content:</strong> Assignments, submissions, grades, feedback</li>
              <li><strong>Communication Data:</strong> Messages, comments, and interactions within the platform</li>
              <li><strong>Profile Information:</strong> Optional profile details and preferences</li>
            </ul>

            <h3>1.2 Automatically Collected Information</h3>
            <ul>
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
              <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
              <li><strong>Cookies:</strong> We use essential cookies for authentication and platform functionality</li>
            </ul>

            <h3>1.3 Educational Records (FERPA Protected)</h3>
            <p>Student educational records are protected under the Family Educational Rights and Privacy Act (FERPA). We collect and maintain:</p>
            <ul>
              <li>Academic assignments and submissions</li>
              <li>Grades and assessment data</li>
              <li>Teacher feedback and comments</li>
              <li>Learning progress and analytics</li>
            </ul>

            <h2>2. Google User Data: What We Access and How We Use It</h2>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 my-6">
              <h3 className="text-white mb-4">📋 Complete Google Data Disclosure</h3>
              
              <h4 className="text-lg font-semibold text-slate-200 mt-4 mb-2">Data Accessed from Google</h4>
              <p>When you sign in with Google or connect your Google account to Schoolace, we request access to the following specific types of Google user data:</p>
              <ul className="space-y-2">
                <li><strong>Basic Profile Information:</strong>
                  <ul className="ml-4 mt-1">
                    <li>Your full name</li>
                    <li>Your email address</li>
                    <li>Your profile picture URL</li>
                    <li>Your Google Account ID</li>
                  </ul>
                </li>
                <li><strong>Google Calendar Data (Optional - Only if you enable calendar integration):</strong>
                  <ul className="ml-4 mt-1">
                    <li>Read access to view your calendar events</li>
                    <li>Write access to create assignment due dates on your calendar</li>
                    <li>Ability to modify events created by Schoolace</li>
                  </ul>
                </li>
                <li><strong>Google Drive Data (Optional - Only if you enable Drive integration):</strong>
                  <ul className="ml-4 mt-1">
                    <li>Read access to files you explicitly choose to attach to assignments</li>
                    <li>Write access to upload assignment submissions to your Drive</li>
                    <li>File metadata (filename, size, type)</li>
                  </ul>
                </li>
              </ul>

              <h4 className="text-lg font-semibold text-slate-200 mt-6 mb-2">How We Use Google User Data</h4>
              <p>Schoolace uses the Google user data we access solely for the following specific purposes:</p>
              <ul className="space-y-2">
                <li><strong>Authentication & Account Management:</strong>
                  <ul className="ml-4 mt-1">
                    <li>To verify your identity when you log in</li>
                    <li>To create and maintain your Schoolace account</li>
                    <li>To associate your educational records with your account</li>
                    <li>To display your name and profile picture in the app</li>
                  </ul>
                </li>
                <li><strong>Educational Communication:</strong>
                  <ul className="ml-4 mt-1">
                    <li>To send you assignment notifications to your Gmail address</li>
                    <li>To email grade release notifications</li>
                    <li>To send important platform updates and announcements</li>
                  </ul>
                </li>
                <li><strong>Calendar Integration (Optional Feature):</strong>
                  <ul className="ml-4 mt-1">
                    <li>To display assignment due dates in your Google Calendar</li>
                    <li>To automatically create calendar events when assignments are created</li>
                    <li>To help you manage your academic schedule</li>
                  </ul>
                </li>
                <li><strong>File Management (Optional Feature):</strong>
                  <ul className="ml-4 mt-1">
                    <li>To allow you to attach files from your Google Drive to assignment submissions</li>
                    <li>To save assignment feedback files to your Drive</li>
                    <li>To provide seamless file access without manual downloads/uploads</li>
                  </ul>
                </li>
              </ul>

              <h4 className="text-lg font-semibold text-slate-200 mt-6 mb-2">Google API Services User Data Policy Compliance</h4>
              <p>Schoolace's use of information received from Google APIs strictly adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-indigo-400">Google API Services User Data Policy</a>, including the Limited Use requirements. Specifically:</p>
              <ul className="space-y-2">
                <li>✅ We <strong>ONLY</strong> access Google user data that is necessary to provide the specific educational features you've requested</li>
                <li>✅ We <strong>DO NOT</strong> use Google user data for serving advertisements</li>
                <li>✅ We <strong>DO NOT</strong> sell, rent, or share your Google user data with third parties for marketing or advertising purposes</li>
                <li>✅ We <strong>DO NOT</strong> use Google user data to train AI models or machine learning systems without your explicit consent</li>
                <li>✅ We <strong>DO NOT</strong> allow humans to read your Google data unless:
                  <ul className="ml-4 mt-1">
                    <li>You explicitly give us permission</li>
                    <li>It's necessary for security purposes (e.g., investigating abuse)</li>
                    <li>It's required to comply with applicable law</li>
                  </ul>
                </li>
                <li>✅ We <strong>DO NOT</strong> transfer Google user data to third parties except:
                  <ul className="ml-4 mt-1">
                    <li>As necessary to provide core Schoolace services (e.g., secure cloud storage providers bound by strict data protection agreements)</li>
                    <li>With your explicit consent</li>
                    <li>For legal reasons (subpoena, court order)</li>
                  </ul>
                </li>
                <li>✅ You can <strong>revoke</strong> Schoolace's access to your Google account at any time through your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-indigo-400">Google Account permissions page</a></li>
              </ul>

              <h4 className="text-lg font-semibold text-slate-200 mt-6 mb-2">Data Storage & Protection</h4>
              <ul className="space-y-2">
                <li><strong>Access Tokens:</strong> Google OAuth access tokens are encrypted and stored securely in our database</li>
                <li><strong>No Password Storage:</strong> We never see or store your Google password</li>
                <li><strong>Minimal Data Retention:</strong> We only retain Google user data for as long as necessary to provide our services</li>
                <li><strong>Encryption:</strong> All Google user data is encrypted both in transit (TLS/SSL) and at rest</li>
                <li><strong>Access Controls:</strong> Only authorized Schoolace systems and personnel with a legitimate educational purpose can access Google user data</li>
                <li><strong>Regular Audits:</strong> We conduct regular security audits of our Google API integration</li>
              </ul>

              <h4 className="text-lg font-semibold text-slate-200 mt-6 mb-2">Your Control Over Google Data</h4>
              <p>You have full control over your Google data:</p>
              <ul className="space-y-2">
                <li><strong>Revoke Access:</strong> You can disconnect your Google account from Schoolace at any time through your Google Account settings at <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-indigo-400">myaccount.google.com/permissions</a></li>
                <li><strong>Selective Permissions:</strong> During sign-in, you can choose which Google permissions to grant (though some may be required for core functionality)</li>
                <li><strong>Data Deletion:</strong> When you delete your Schoolace account or revoke Google access, all associated Google data is permanently deleted from our systems within 30 days</li>
                <li><strong>View Access History:</strong> You can view when and how Schoolace has accessed your Google data through Google's security settings</li>
              </ul>
            </div>

            <h2>3. How We Use Your Information</h2>

            <h3>3.1 Educational Purposes</h3>
            <ul>
              <li>Facilitate teaching and learning activities</li>
              <li>Provide AI-powered grading and feedback</li>
              <li>Enable communication between teachers and students</li>
              <li>Track academic progress and performance</li>
              <li>Generate personalized learning recommendations</li>
            </ul>

            <h3>3.2 Platform Operations</h3>
            <ul>
              <li>Maintain and improve platform functionality</li>
              <li>Provide customer support</li>
              <li>Ensure platform security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h3>3.3 AI and Machine Learning</h3>
            <p>We use AI technology to:</p>
            <ul>
              <li>Automatically grade assignments based on teacher-provided rubrics</li>
              <li>Provide personalized feedback to students</li>
              <li>Generate educational content and recommendations</li>
              <li>Detect potential academic integrity issues</li>
            </ul>
            <p><strong>Important:</strong> All AI processing is done to support educational goals. We do not train our AI models on student data or Google user data without explicit consent.</p>

            <h2>4. Information Sharing and Disclosure</h2>

            <h3>4.1 Within Educational Settings</h3>
            <ul>
              <li><strong>Teachers:</strong> Can access information for students in their classes</li>
              <li><strong>Students:</strong> Can view their own assignments, grades, and feedback</li>
              <li><strong>School Administrators:</strong> May access aggregated data for their institution</li>
            </ul>

            <h3>4.2 Third-Party Service Providers</h3>
            <p>We work with carefully vetted third-party service providers who are bound by strict data protection agreements:</p>
            <ul>
              <li><strong>Authentication:</strong> Google OAuth for secure login services (see Section 2 for details on Google data usage)</li>
              <li><strong>Cloud Storage:</strong> Secure file storage infrastructure for submissions and attachments</li>
              <li><strong>AI Services:</strong> OpenAI for AI-powered grading and feedback features
                <ul className="ml-4 mt-1">
                  <li>OpenAI does not train models on data submitted through our API</li>
                  <li>Student submissions are processed ephemerally and not retained by OpenAI</li>
                  <li>All data sent to OpenAI is encrypted in transit</li>
                </ul>
              </li>
              <li><strong>Payment Processing:</strong> Stripe for subscription management
                <ul className="ml-4 mt-1">
                  <li>Stripe handles all payment card information</li>
                  <li>We never see or store your full payment card numbers</li>
                </ul>
              </li>
              <li><strong>Analytics:</strong> Google Analytics for aggregated usage statistics
                <ul className="ml-4 mt-1">
                  <li>No personally identifiable student information is sent to Google Analytics</li>
                  <li>Used only for improving platform performance and user experience</li>
                </ul>
              </li>
            </ul>
            <p><strong>Important:</strong> All third-party services are carefully vetted and bound by data protection agreements that prohibit them from using your data for their own purposes.</p>

            <h3>4.3 We Do NOT Share Google User Data</h3>
            <p>Specifically regarding Google user data, we <strong>DO NOT</strong>:</p>
            <ul>
              <li>❌ Sell Google user data to any third party</li>
              <li>❌ Share Google user data with advertisers or marketing companies</li>
              <li>❌ Allow AI training on Google user data</li>
              <li>❌ Transfer Google user data outside our secure infrastructure except as explicitly stated in Section 2</li>
              <li>❌ Use Google Calendar or Drive data for any purpose other than the specific features you've enabled</li>
            </ul>

            <h3>4.4 Legal Requirements</h3>
            <p>We may disclose information (including Google user data) only when required by law:</p>
            <ul>
              <li>Compliance with legal process (subpoenas, court orders)</li>
              <li>Protection of our rights or property</li>
              <li>Investigation of potential violations of our Terms of Service</li>
              <li>Emergency situations involving safety or preventing harm</li>
            </ul>

            <h2>5. Data Security & Protection</h2>

            <h3>5.1 Security Measures</h3>
            <p>We implement industry-leading security measures to protect all user data, including Google user data:</p>
            <ul>
              <li><strong>Encryption in Transit:</strong> All data transmitted using TLS 1.3 encryption</li>
              <li><strong>Encryption at Rest:</strong> All stored data is encrypted using AES-256 encryption</li>
              <li><strong>Access Controls:</strong> Role-based access control (RBAC) with multi-factor authentication for staff</li>
              <li><strong>Data Storage:</strong> Secure cloud infrastructure (AWS/Google Cloud) with regular backups</li>
              <li><strong>Monitoring:</strong> 24/7 security monitoring and automated threat detection</li>
              <li><strong>Staff Training:</strong> Regular privacy and security training for all personnel</li>
              <li><strong>Penetration Testing:</strong> Regular security audits and penetration testing</li>
              <li><strong>Incident Response:</strong> Comprehensive incident response plan</li>
            </ul>

            <h3>5.2 Google Data Security</h3>
            <p>Specific security measures for Google user data:</p>
            <ul>
              <li>OAuth tokens are encrypted and never exposed in logs or error messages</li>
              <li>Tokens are refreshed automatically and expired tokens are immediately deleted</li>
              <li>We use the minimum necessary OAuth scopes for each feature</li>
              <li>All Google API calls are made over HTTPS</li>
              <li>We comply with Google's security best practices and requirements</li>
            </ul>

            <h3>5.3 Data Breach Protocol</h3>
            <p>In the event of a data breach involving personally identifiable information or Google user data:</p>
            <ul>
              <li>We will notify affected users within 72 hours of discovering the breach</li>
              <li>We will notify relevant educational institutions</li>
              <li>We will report to appropriate authorities as required by law</li>
              <li>We will take immediate steps to mitigate harm and prevent future breaches</li>
              <li>We will work with Google's security team if Google data was compromised</li>
            </ul>

            <h2>6. Data Retention and Deletion</h2>

            <h3>6.1 Retention Period</h3>
            <ul>
              <li><strong>Active Accounts:</strong> Data retained while account is active and in use</li>
              <li><strong>Inactive Accounts:</strong> Data may be retained for up to 1 year after last activity, then automatically deleted</li>
              <li><strong>Educational Records:</strong> Retained according to school policies, FERPA requirements, and legal obligations</li>
              <li><strong>Backups:</strong> Deleted from backups within 90 days of account deletion</li>
              <li><strong>Google OAuth Tokens:</strong> Automatically deleted within 24 hours of account deletion or revocation</li>
              <li><strong>Google Calendar/Drive Data:</strong> Immediately removed from our systems when you revoke access</li>
            </ul>

            <h3>6.2 Your Right to Delete Data</h3>
            <p>You have the right to request deletion of your data at any time:</p>
            <ul>
              <li><strong>Self-Service Deletion:</strong> Delete your account through account settings</li>
              <li><strong>Email Request:</strong> Email us at privacy@schoolace.org</li>
              <li><strong>Google Data Deletion:</strong> Revoke Schoolace's access through your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-indigo-400">Google Account permissions</a></li>
              <li><strong>Processing Time:</strong> Deletion requests processed within 30 days</li>
              <li><strong>Exceptions:</strong> Some data may be retained if required by law or for legal proceedings</li>
            </ul>

            <h3>6.3 What Happens When You Delete Your Account</h3>
            <ul>
              <li>Your account is immediately deactivated</li>
              <li>All Google OAuth access is revoked immediately</li>
              <li>Personal information is permanently deleted within 30 days</li>
              <li>Educational records may be retained for schools' record-keeping (per FERPA)</li>
              <li>Anonymized aggregate data may be retained for analytics</li>
            </ul>

            <h2>7. FERPA Compliance</h2>

            <h3>7.1 School Official Exception</h3>
            <p>Under FERPA, Schoolace acts as a "school official" with legitimate educational interests. This means:</p>
            <ul>
              <li>We use student data only for educational purposes</li>
              <li>We maintain appropriate security measures</li>
              <li>We do not re-disclose personally identifiable information</li>
              <li>We destroy data when no longer needed for educational purposes</li>
            </ul>

            <h3>7.2 Parental Rights</h3>
            <p>Parents and eligible students have the right to:</p>
            <ul>
              <li>Inspect and review educational records</li>
              <li>Request corrections to inaccurate information</li>
              <li>Control disclosure of personally identifiable information</li>
              <li>File complaints with the U.S. Department of Education</li>
            </ul>

            <h2>8. Student Privacy Protection</h2>

            <h3>8.1 COPPA Compliance (Children Under 13)</h3>
            <ul>
              <li>We obtain verifiable parental consent before collecting information from children under 13</li>
              <li>Parents can review and delete their child's information</li>
              <li>We collect only information reasonably necessary for educational activities</li>
              <li>We do not condition participation on disclosure of unnecessary information</li>
            </ul>

            <h3>8.2 Student Privacy Pledge</h3>
            <p>We commit to:</p>
            <ul>
              <li>✅ NOT sell student personal information</li>
              <li>✅ NOT use student data for behavioral targeting of advertisements</li>
              <li>✅ NOT build marketing profiles of students</li>
              <li>✅ Use data only to support authorized educational purposes</li>
              <li>✅ Maintain comprehensive security programs</li>
              <li>✅ Comply with all applicable privacy laws (FERPA, COPPA, GDPR, CCPA)</li>
            </ul>

            <h2>9. Your Rights and Choices</h2>

            <h3>9.1 Access and Correction</h3>
            <ul>
              <li>View your personal information through your account settings</li>
              <li>Update inaccurate or incomplete information</li>
              <li>Request a copy of your data in portable format (CSV, PDF)</li>
              <li>Manage your Google account connection and permissions</li>
            </ul>

            <h3>9.2 Data Portability</h3>
            <p>You can export your data in common formats:</p>
            <ul>
              <li>Download assignment submissions as PDF</li>
              <li>Export grades and feedback as CSV</li>
              <li>Request full data export from privacy@schoolace.org</li>
            </ul>

            <h3>9.3 Opt-Out Rights</h3>
            <ul>
              <li><strong>Marketing Communications:</strong> Unsubscribe from promotional emails (we don't send marketing to students)</li>
              <li><strong>Optional Features:</strong> Disable AI grading, calendar integration, or Drive integration</li>
              <li><strong>Analytics:</strong> Request exclusion from aggregated analytics</li>
              <li><strong>Google Integration:</strong> Disconnect Google account access at any time</li>
            </ul>

            <h2>10. International Data Transfers</h2>
            <p>Schoolace operates primarily in the United States. If you access our platform from outside the U.S.:</p>
            <ul>
              <li>Your data may be transferred to and processed in the United States</li>
              <li>We implement appropriate safeguards (Standard Contractual Clauses)</li>
              <li>We comply with GDPR for European users</li>
              <li>Google user data is handled in accordance with Google's data residency policies</li>
            </ul>

            <h2>11. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes by:</p>
            <ul>
              <li>Posting a prominent notice on our platform</li>
              <li>Sending an email notification to your registered email</li>
              <li>Requiring acceptance of new terms upon login (for significant changes)</li>
              <li>Posting updated policy at least 30 days before changes take effect</li>
            </ul>
            <p>Your continued use of Schoolace after changes indicates acceptance of the updated policy. If you don't agree to changes, you may delete your account.</p>

            <h2>12. Contact Us</h2>
            <p>For questions about this Privacy Policy, our privacy practices, or Google data usage:</p>
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl mt-4">
              <p className="mb-2 text-white font-semibold">Schoolace Privacy Office</p>
              <p className="text-sm text-slate-300">Email: <a href="mailto:privacy@schoolace.org" className="text-indigo-400">privacy@schoolace.org</a></p>
              <p className="text-sm text-slate-300">For FERPA-related requests: <a href="mailto:ferpa@schoolace.org" className="text-indigo-400">ferpa@schoolace.org</a></p>
              <p className="text-sm text-slate-300">For Google data concerns: <a href="mailto:privacy@schoolace.org" className="text-indigo-400">privacy@schoolace.org</a></p>
              <p className="text-sm text-slate-300 mt-2">Response time: Within 5 business days</p>
            </div>

            <h2>13. Additional Resources</h2>
            <ul>
              <li><strong>FERPA Information:</strong> <a href="https://www2.ed.gov/policy/gen/guid/fpco/ferpa/index.html" target="_blank" rel="noopener noreferrer" className="text-indigo-400">U.S. Department of Education</a></li>
              <li><strong>COPPA Information:</strong> <a href="https://www.ftc.gov/enforcement/rules/rulemaking-regulatory-reform-proceedings/childrens-online-privacy-protection-rule" target="_blank" rel="noopener noreferrer" className="text-indigo-400">Federal Trade Commission</a></li>
              <li><strong>Google API Services User Data Policy:</strong> <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-indigo-400">Google Developers</a></li>
              <li><strong>Student Privacy Pledge:</strong> <a href="https://studentprivacypledge.org/" target="_blank" rel="noopener noreferrer" className="text-indigo-400">Student Privacy Pledge Organization</a></li>
              <li><strong>Your Google Account Permissions:</strong> <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-indigo-400">Manage Third-Party Access</a></li>
            </ul>

            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6 mt-8">
              <h3 className="text-lg font-semibold text-white mb-2">Your Privacy Matters</h3>
              <p className="text-sm text-slate-300">
                At Schoolace, we take privacy seriously. We are committed to transparency, security, and compliance with all applicable privacy laws including FERPA, COPPA, and Google's API Services User Data Policy. Your trust is important to us, and we work hard to protect your data every day. If you have any concerns about how your data is handled, please don't hesitate to reach out to us at privacy@schoolace.org.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative pt-8 pb-6 bg-black/20 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Schoolace. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, FileText, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const specificDate = "September 1, 2025";
const lastUpdated = "October 12, 2025";

export default function TermsOfService() {
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
              <FileText className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Terms of Service
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
              Welcome to Schoolace. These Terms of Service ("Terms") govern your access to and use of our educational platform, including our website, applications, and services (collectively, the "Platform"). By accessing or using Schoolace, you agree to be bound by these Terms.
            </p>

            <h2>1. Acceptance of Terms</h2>

            <h3>1.1 Agreement to Terms</h3>
            <p>
              By creating an account or using Schoolace, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree, you must not use our Platform.
            </p>

            <h3>1.2 Age Requirements</h3>
            <ul>
              <li><strong>Teachers and Administrators:</strong> Must be at least 18 years old</li>
              <li><strong>Students Under 13:</strong> Require parental or school consent</li>
              <li><strong>Students 13-18:</strong> May use Platform with school authorization</li>
            </ul>

            <h3>1.3 Educational Institution Requirements</h3>
            <p>
              Educational institutions must ensure they have appropriate rights and permissions to authorize student use of Schoolace, including compliance with FERPA, COPPA, and other applicable laws.
            </p>

            <h2>2. User Accounts</h2>

            <h3>2.1 Account Creation</h3>
            <ul>
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining account security</li>
              <li>You must not share your account credentials</li>
              <li>You must notify us immediately of unauthorized access</li>
            </ul>

            <h3>2.2 Google Sign-In</h3>
            <p>If you choose to sign in with Google:</p>
            <ul>
              <li>You authorize Schoolace to access your Google account information as described in our Privacy Policy</li>
              <li>You agree to Google's Terms of Service and Privacy Policy</li>
              <li>You can revoke Schoolace's access to your Google account at any time through your Google Account settings</li>
              <li>Schoolace's use of information received from Google APIs adheres to <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements</li>
            </ul>

            <h3>2.3 Account Types</h3>
            <ul>
              <li><strong>Teacher Accounts:</strong> Create classes, assignments, and manage students</li>
              <li><strong>Student Accounts:</strong> Access classes, submit work, receive feedback</li>
              <li><strong>Administrator Accounts:</strong> Manage school-wide settings and users</li>
            </ul>

            <h3>2.4 Account Termination</h3>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or for any other reason at our discretion. You may delete your account at any time through account settings.
            </p>

            <h2>3. Acceptable Use</h2>

            <h3>3.1 Permitted Uses</h3>
            <p>You may use Schoolace for:</p>
            <ul>
              <li>Educational teaching and learning activities</li>
              <li>Assignment creation, submission, and grading</li>
              <li>Communication between teachers and students</li>
              <li>Academic progress tracking</li>
              <li>Educational content creation</li>
            </ul>

            <h3>3.2 Prohibited Uses</h3>
            <p>You must NOT:</p>
            <ul>
              <li>Use the Platform for any illegal or unauthorized purpose</li>
              <li>Harass, bully, or threaten other users</li>
              <li>Post or share inappropriate, offensive, or harmful content</li>
              <li>Violate others' intellectual property rights</li>
              <li>Attempt to gain unauthorized access to the Platform</li>
              <li>Use automated systems to access the Platform without permission</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with or disrupt the Platform's operation</li>
              <li>Share personal information of other users without consent</li>
              <li>Use the Platform for commercial purposes without authorization</li>
              <li>Abuse Google API access or violate Google's terms of service</li>
            </ul>

            <h3>3.3 Academic Integrity</h3>
            <ul>
              <li>Students must submit original work</li>
              <li>Plagiarism and cheating are prohibited</li>
              <li>AI detection tools may be used to maintain academic integrity</li>
              <li>Violations may result in account suspension and notification to school administrators</li>
            </ul>

            <h2>4. Content and Intellectual Property</h2>

            <h3>4.1 Your Content</h3>
            <p>
              You retain ownership of content you create and submit on Schoolace ("Your Content"), including:
            </p>
            <ul>
              <li>Assignments and student submissions</li>
              <li>Teacher-created materials and lesson plans</li>
              <li>Comments and feedback</li>
              <li>Uploaded files and documents</li>
            </ul>

            <h3>4.2 License to Schoolace</h3>
            <p>
              By submitting Your Content, you grant Schoolace a limited, non-exclusive, royalty-free license to:
            </p>
            <ul>
              <li>Store and display Your Content on the Platform</li>
              <li>Process Your Content to provide Platform services (e.g., AI grading)</li>
              <li>Share Your Content with authorized users (teachers, students in your class)</li>
            </ul>
            <p>
              <strong>Important:</strong> We do NOT claim ownership of Your Content, and we will not use it for purposes beyond providing Platform services without your explicit consent.
            </p>

            <h3>4.3 Schoolace Intellectual Property</h3>
            <p>
              Schoolace and its licensors own all rights to:
            </p>
            <ul>
              <li>Platform software, design, and functionality</li>
              <li>Schoolace trademarks, logos, and branding</li>
              <li>Documentation and user guides</li>
              <li>AI models and algorithms</li>
            </ul>
            <p>
              You may not copy, modify, distribute, or create derivative works without our written permission.
            </p>

            <h3>4.4 Third-Party Content and Services</h3>
            <p>
              Schoolace integrates with third-party services including Google. You agree to:
            </p>
            <ul>
              <li>Comply with third-party terms of service and privacy policies</li>
              <li>Acknowledge that we are not responsible for third-party content or services</li>
              <li>Understand that third-party availability may affect Platform functionality</li>
            </ul>

            <h2>5. AI-Powered Features</h2>

            <h3>5.1 AI Grading and Feedback</h3>
            <ul>
              <li>AI grading is provided as an assistive tool for teachers</li>
              <li>Teachers maintain final authority over all grades</li>
              <li>AI-generated feedback should be reviewed by teachers</li>
              <li>Students can request human review of AI-generated grades</li>
            </ul>

            <h3>5.2 AI Limitations</h3>
            <p>
              You acknowledge that:
            </p>
            <ul>
              <li>AI systems may make errors or produce inaccurate results</li>
              <li>AI grading is based on provided rubrics and instructions</li>
              <li>Complex or subjective assignments may require human review</li>
              <li>AI cannot replace human judgment and expertise</li>
            </ul>

            <h3>5.3 AI Data Usage</h3>
            <p>
              We use third-party AI services (such as OpenAI) to power our features. Student submissions may be processed by these services, but:
            </p>
            <ul>
              <li>We do not allow AI providers to train on student data</li>
              <li>Data is processed securely and deleted after use</li>
              <li>We comply with all applicable privacy laws</li>
            </ul>

            <h2>6. Payments and Subscriptions</h2>

            <h3>6.1 Pricing</h3>
            <ul>
              <li><strong>Free Tier:</strong> Limited features for individual teachers</li>
              <li><strong>Pro Tier:</strong> Monthly or annual subscription for enhanced features</li>
              <li><strong>School/District:</strong> Custom pricing for institutions</li>
            </ul>

            <h3>6.2 Payment Terms</h3>
            <ul>
              <li>Payments are processed through Stripe</li>
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>Prices are subject to change with 30 days' notice</li>
              <li>All fees are non-refundable unless required by law</li>
            </ul>

            <h3>6.3 Cancellation</h3>
            <ul>
              <li>You may cancel your subscription at any time</li>
              <li>Access continues until the end of the billing period</li>
              <li>No partial refunds for unused time</li>
              <li>Data may be retained according to our Privacy Policy</li>
            </ul>

            <h2>7. Privacy and Data Protection</h2>

            <h3>7.1 Privacy Policy</h3>
            <p>
              Our <Link to={createPageUrl('PrivacyPolicy')} className="text-indigo-400 hover:text-indigo-300">Privacy Policy</Link> explains how we collect, use, and protect your information. By using Schoolace, you also agree to our Privacy Policy.
            </p>

            <h3>7.2 Google Data</h3>
            <p>
              If you connect your Google account:
            </p>
            <ul>
              <li>Your Google data is used only for the purposes described in our Privacy Policy</li>
              <li>We comply with Google API Services User Data Policy, including Limited Use requirements</li>
              <li>You can revoke access at any time through your Google Account settings</li>
              <li>We do not sell, rent, or share your Google data with third parties for marketing purposes</li>
            </ul>

            <h3>7.3 FERPA Compliance</h3>
            <p>
              Schoolace complies with the Family Educational Rights and Privacy Act (FERPA) and acts as a "school official" under FERPA's school official exception.
            </p>

            <h3>7.4 Data Security</h3>
            <p>
              While we implement industry-standard security measures, no system is completely secure. You agree to use strong passwords and protect your account credentials.
            </p>

            <h2>8. Disclaimers and Limitations of Liability</h2>

            <h3>8.1 Platform "As Is"</h3>
            <p>
              THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>

            <h3>8.2 Third-Party Service Availability</h3>
            <p>
              Schoolace's functionality may depend on third-party services (including Google services). We are not responsible for:
            </p>
            <ul>
              <li>Third-party service interruptions or failures</li>
              <li>Changes to third-party APIs or terms of service</li>
              <li>Data loss resulting from third-party service issues</li>
            </ul>

            <h3>8.3 No Guarantee of Availability</h3>
            <ul>
              <li>We do not guarantee uninterrupted or error-free service</li>
              <li>The Platform may be unavailable due to maintenance or technical issues</li>
              <li>We are not responsible for data loss due to technical failures</li>
            </ul>

            <h3>8.4 Limitation of Liability</h3>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SCHOOLACE SHALL NOT BE LIABLE FOR:
            </p>
            <ul>
              <li>Indirect, incidental, special, or consequential damages</li>
              <li>Loss of profits, data, or opportunities</li>
              <li>Damages resulting from unauthorized access to your account</li>
              <li>Damages from third-party content or services</li>
              <li>Issues arising from Google API service interruptions</li>
            </ul>
            <p>
              OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO SCHOOLACE IN THE PAST 12 MONTHS, OR $100, WHICHEVER IS GREATER.
            </p>

            <h2>9. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Schoolace and its officers, directors, employees, and agents from any claims, losses, damages, liabilities, and expenses (including legal fees) arising from:
            </p>
            <ul>
              <li>Your use of the Platform</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your Content posted on the Platform</li>
              <li>Your violation of Google's terms of service</li>
            </ul>

            <h2>10. Termination</h2>

            <h3>10.1 Termination by You</h3>
            <p>
              You may terminate your account at any time by:
            </p>
            <ul>
              <li>Using account deletion tools in settings</li>
              <li>Contacting contact@schoolace.org</li>
              <li>Revoking Google OAuth access (if applicable)</li>
            </ul>

            <h3>10.2 Termination by Schoolace</h3>
            <p>
              We may terminate or suspend your access immediately, without notice, for:
            </p>
            <ul>
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Behavior that harms other users</li>
              <li>Non-payment of fees</li>
              <li>Violation of third-party terms (including Google's terms)</li>
              <li>Any other reason at our discretion</li>
            </ul>

            <h3>10.3 Effect of Termination</h3>
            <p>
              Upon termination:
            </p>
            <ul>
              <li>Your right to access the Platform immediately ceases</li>
              <li>Your Content may be deleted (subject to retention policies)</li>
              <li>Connected Google account access is automatically revoked</li>
              <li>Provisions regarding intellectual property, disclaimers, and limitations of liability survive termination</li>
            </ul>

            <h2>11. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. We will notify users of material changes by:
            </p>
            <ul>
              <li>Posting updated Terms on the Platform</li>
              <li>Sending email notifications</li>
              <li>Displaying a notice when you log in</li>
            </ul>
            <p>
              Continued use of the Platform after changes constitutes acceptance of the modified Terms. If you do not agree to the changes, you must stop using the Platform.
            </p>

            <h2>12. General Provisions</h2>

            <h3>12.1 Entire Agreement</h3>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Schoolace regarding the Platform.
            </p>

            <h3>12.2 Governing Law</h3>
            <p>
              These Terms are governed by the laws of the State of California, United States, without regard to conflict of law principles.
            </p>

            <h3>12.3 Severability</h3>
            <p>
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect.
            </p>

            <h2>13. Contact Information</h2>
            <p>
              For questions about these Terms, please contact us:
            </p>
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl mt-4">
              <p className="mb-2 text-white font-semibold">Schoolace Legal Department</p>
              <p className="text-sm text-slate-300">Email: <a href="mailto:contact@schoolace.org" className="text-indigo-400">legal@schoolace.org</a></p>
              <p className="text-sm text-slate-300">Support: <a href="mailto:contact@schoolace.org" className="text-indigo-400">support@schoolace.org</a></p>
              <p className="text-sm text-slate-300 mt-2">Response time: Within 5 business days</p>
            </div>

            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6 mt-8">
              <h3 className="text-lg font-semibold text-white mb-2">Thank You for Using Schoolace</h3>
              <p className="text-sm text-slate-300">
                By using our Platform, you're joining a community dedicated to enhancing education through technology. We're committed to providing a safe, secure, and effective learning environment for all users while respecting your rights and complying with all applicable laws and third-party terms of service.
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
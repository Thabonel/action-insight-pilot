import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LogoMarkIcon from '@/components/LogoMarkIcon';

const AcceptableUsePolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <LogoMarkIcon className="h-8 w-8" />
              <span className="text-xl font-bold text-black">AI Boost Campaign</span>
            </div>
            <Button variant="ghost" onClick={() => navigate('/')} className="text-black hover:text-blue-600">
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-black mb-4">Acceptable Use Policy</h1>
        <p className="text-gray-600 mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">1. Purpose</h2>
            <p className="text-gray-700">
              This Acceptable Use Policy ("Policy") describes prohibited uses of AI Boost Campaign ("Service"). By using the Service, you agree to comply with this Policy. Violation of this Policy may result in suspension or termination of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">2. Prohibited Activities</h2>

            <h3 className="text-xl font-semibold text-black mb-3">2.1 Illegal Activities</h3>
            <p className="text-gray-700 mb-4">You may not use the Service to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Engage in or promote illegal activities</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Distribute pirated software or copyrighted material</li>
              <li>Engage in fraud, identity theft, or financial scams</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-3">2.2 Harmful Content</h3>
            <p className="text-gray-700 mb-4">You may not create, upload, or distribute content that:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Promotes violence, terrorism, or extremism</li>
              <li>Contains hate speech or discriminatory content</li>
              <li>Depicts or promotes child exploitation</li>
              <li>Contains explicit sexual content without proper age restrictions</li>
              <li>Promotes self-harm or suicide</li>
              <li>Harasses, threatens, or bullies others</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-3">2.3 Spam and Unsolicited Communications</h3>
            <p className="text-gray-700 mb-4">You may not:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Send spam or bulk unsolicited emails</li>
              <li>Engage in email harvesting or scraping</li>
              <li>Use purchased, rented, or third-party email lists without proper consent</li>
              <li>Send emails to people who have not opted in to receive them</li>
              <li>Fail to include unsubscribe mechanisms in email campaigns</li>
              <li>Violate CAN-SPAM Act, GDPR, or other anti-spam laws</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-3">2.4 Deceptive Practices</h3>
            <p className="text-gray-700 mb-4">You may not:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Misrepresent your identity or affiliation</li>
              <li>Impersonate others or create fake accounts</li>
              <li>Engage in phishing or social engineering attacks</li>
              <li>Create misleading or deceptive marketing content</li>
              <li>Make false or unsubstantiated claims about products or services</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-3">2.5 Technical Abuse</h3>
            <p className="text-gray-700 mb-4">You may not:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Attempt to gain unauthorized access to the Service or systems</li>
              <li>Introduce malware, viruses, or malicious code</li>
              <li>Perform penetration testing without written authorization</li>
              <li>Use automated scripts or bots to access the Service</li>
              <li>Overload or disrupt the Service infrastructure</li>
              <li>Reverse engineer, decompile, or extract source code</li>
              <li>Bypass rate limits or usage restrictions</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-3">2.6 Competitive Use</h3>
            <p className="text-gray-700 mb-4">You may not:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Use the Service to build a competing product</li>
              <li>Benchmark or compare performance without permission</li>
              <li>Resell or redistribute access to the Service</li>
              <li>Share your account credentials with competitors</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">3. Marketing-Specific Guidelines</h2>

            <h3 className="text-xl font-semibold text-black mb-3">3.1 Email Marketing</h3>
            <p className="text-gray-700 mb-4">When using email marketing features, you must:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Obtain explicit consent before sending marketing emails</li>
              <li>Include a clear and functional unsubscribe link in all emails</li>
              <li>Honor unsubscribe requests promptly (within 10 business days)</li>
              <li>Accurately identify yourself as the sender</li>
              <li>Avoid misleading subject lines</li>
              <li>Include your physical mailing address</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-3">3.2 AI-Generated Content</h3>
            <p className="text-gray-700 mb-4">When using AI-generated content:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Review and edit AI-generated content before publishing</li>
              <li>Ensure content is factually accurate and not misleading</li>
              <li>Comply with disclosure requirements if applicable</li>
              <li>Do not use AI to generate content that violates prohibited activities</li>
              <li>Respect the AI provider's usage policies (OpenAI, Google, Anthropic, etc.)</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-3">3.3 Social Media</h3>
            <p className="text-gray-700 mb-4">When posting to social media through the Service:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Comply with each platform's terms of service and community guidelines</li>
              <li>Do not engage in artificial engagement (buying followers, likes, etc.)</li>
              <li>Disclose sponsored content and affiliate relationships</li>
              <li>Respect platform-specific content restrictions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">4. Data Privacy and Protection</h2>
            <p className="text-gray-700 mb-4">You must:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Comply with data protection laws (GDPR, CCPA, etc.)</li>
              <li>Obtain proper consent for data collection and processing</li>
              <li>Respect individuals' privacy rights</li>
              <li>Securely store and handle personal data</li>
              <li>Provide clear privacy notices to your contacts</li>
              <li>Honor data subject rights (access, deletion, portability)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">5. API Key Usage</h2>
            <p className="text-gray-700 mb-4">When providing third-party API keys:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Only use API keys that you legally own or are authorized to use</li>
              <li>Comply with all terms of service for the API provider</li>
              <li>Do not share or expose your API keys to unauthorized parties</li>
              <li>Monitor your API usage and costs</li>
              <li>Revoke and replace compromised API keys immediately</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">6. Reporting Violations</h2>
            <p className="text-gray-700 mb-4">
              If you become aware of any violations of this Policy, please report them to:
            </p>
            <ul className="list-none text-gray-700 space-y-2 mb-4">
              <li>Email: abuse@aimarketinghub.com</li>
              <li>Subject Line: "Acceptable Use Policy Violation Report"</li>
            </ul>
            <p className="text-gray-700">
              Include details about the violation, account information (if known), and any supporting evidence.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">7. Enforcement</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to investigate suspected violations of this Policy. If we determine that you have violated this Policy, we may:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Issue a warning</li>
              <li>Temporarily suspend your account</li>
              <li>Permanently terminate your account</li>
              <li>Remove violating content</li>
              <li>Report illegal activities to law enforcement</li>
              <li>Take legal action to recover damages</li>
            </ul>
            <p className="text-gray-700">
              We may take these actions without prior notice and without refund of any fees paid.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">8. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Policy from time to time. We will notify you of material changes by posting the updated Policy on this page with a revised "Last Updated" date. Your continued use of the Service after changes constitutes acceptance of the updated Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">9. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about this Policy, please contact us:
            </p>
            <ul className="list-none text-gray-700 space-y-2">
              <li>Email: legal@aimarketinghub.com</li>
              <li>Address: [Your Business Address]</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AcceptableUsePolicy;

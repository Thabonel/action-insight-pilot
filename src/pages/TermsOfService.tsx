import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, ArrowLeft } from 'lucide-react';

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-black">AI Marketing Hub</span>
            </div>
            <Button variant="ghost" onClick={() => navigate('/')} className="text-black hover:text-blue-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-black mb-4">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700">
              By accessing or using AI Marketing Hub ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              AI Marketing Hub provides an AI-powered marketing automation platform that includes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Campaign creation and management tools</li>
              <li>Lead generation and nurturing capabilities</li>
              <li>Content creation and optimization features</li>
              <li>Analytics and reporting dashboards</li>
              <li>Integration with third-party AI services (using your API keys)</li>
              <li>Multi-channel marketing automation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-semibold text-black mb-3">3.1 Account Creation</h3>
            <p className="text-gray-700 mb-4">
              To use the Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
            </p>

            <h3 className="text-xl font-semibold text-black mb-3">3.2 Account Security</h3>
            <p className="text-gray-700">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">4. User-Provided API Keys</h2>
            <h3 className="text-xl font-semibold text-black mb-3">4.1 Your Responsibility</h3>
            <p className="text-gray-700 mb-4">
              You may provide your own API keys for third-party services (OpenAI, Google Gemini, Anthropic Claude, etc.). By providing these keys:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>You represent that you have the legal right to use these API keys</li>
              <li>You agree to comply with all third-party provider terms of service</li>
              <li>You are solely responsible for all costs incurred with third-party providers</li>
              <li>You understand that data sent to third-party providers is subject to their privacy policies</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-3">4.2 No Markup</h3>
            <p className="text-gray-700">
              We do not mark up costs from third-party AI providers. You pay them directly based on your usage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">5. Acceptable Use</h2>
            <p className="text-gray-700 mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Send spam or unsolicited communications</li>
              <li>Upload malicious code or viruses</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Use the Service to harm, harass, or deceive others</li>
              <li>Reverse engineer or attempt to extract source code</li>
              <li>Resell or redistribute the Service without authorization</li>
            </ul>
            <p className="text-gray-700 mt-4">
              See our Acceptable Use Policy for more details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">6. Payment and Billing</h2>
            <h3 className="text-xl font-semibold text-black mb-3">6.1 Fees</h3>
            <p className="text-gray-700 mb-4">
              You agree to pay all fees associated with your subscription plan. Fees are billed in advance on a recurring basis (monthly or annually).
            </p>

            <h3 className="text-xl font-semibold text-black mb-3">6.2 Auto-Renewal</h3>
            <p className="text-gray-700 mb-4">
              Your subscription will automatically renew unless you cancel before the renewal date. You may cancel at any time through your account settings.
            </p>

            <h3 className="text-xl font-semibold text-black mb-3">6.3 Refunds</h3>
            <p className="text-gray-700">
              Fees are non-refundable except as required by law or as expressly stated in our refund policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">7. Intellectual Property</h2>
            <h3 className="text-xl font-semibold text-black mb-3">7.1 Our Rights</h3>
            <p className="text-gray-700 mb-4">
              The Service and its original content, features, and functionality are owned by AI Marketing Hub and are protected by copyright, trademark, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-black mb-3">7.2 Your Content</h3>
            <p className="text-gray-700 mb-4">
              You retain all rights to content you create or upload to the Service ("Your Content"). By using the Service, you grant us a limited license to use, store, and process Your Content solely to provide the Service to you.
            </p>

            <h3 className="text-xl font-semibold text-black mb-3">7.3 AI-Generated Content</h3>
            <p className="text-gray-700">
              Content generated by AI through the Service belongs to you, subject to the terms of the underlying AI provider (OpenAI, Google, Anthropic, etc.). You are responsible for reviewing and complying with their terms regarding AI-generated content ownership and use.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">8. Data and Privacy</h2>
            <p className="text-gray-700">
              Our use of your personal data is governed by our Privacy Policy. By using the Service, you consent to our collection and use of personal data as described in the Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">9. Disclaimers and Limitations of Liability</h2>
            <h3 className="text-xl font-semibold text-black mb-3">9.1 No Warranties</h3>
            <p className="text-gray-700 mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>

            <h3 className="text-xl font-semibold text-black mb-3">9.2 Limitation of Liability</h3>
            <p className="text-gray-700 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, AI MARKETING HUB SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>

            <h3 className="text-xl font-semibold text-black mb-3">9.3 Third-Party Services</h3>
            <p className="text-gray-700">
              We are not responsible for the performance, reliability, or availability of third-party AI services (OpenAI, Google, Anthropic, etc.) or any content, products, or services provided by third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">10. Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify and hold harmless AI Marketing Hub and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including attorney fees) arising from your use of the Service, violation of these Terms, or infringement of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">11. Termination</h2>
            <p className="text-gray-700">
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">12. Governing Law</h2>
            <p className="text-gray-700">
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">13. Changes to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the new Terms on this page and updating the "Last Updated" date. Your continued use of the Service after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">14. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about these Terms, please contact us:
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

export default TermsOfService;

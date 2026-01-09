import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import LogoMarkIcon from '@/components/LogoMarkIcon';

const CookiePolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <LogoMarkIcon className="h-8 w-8" />
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
        <h1 className="text-4xl font-bold text-black mb-4">Cookie Policy</h1>
        <p className="text-gray-600 mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">1. What Are Cookies</h2>
            <p className="text-gray-700">
              Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">2. How We Use Cookies</h2>
            <p className="text-gray-700 mb-4">
              AI Marketing Hub uses cookies to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Keep you signed in to your account</li>
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our Service</li>
              <li>Improve our Service performance and functionality</li>
              <li>Provide security features and prevent fraud</li>
              <li>Analyze usage patterns and measure effectiveness</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">3. Types of Cookies We Use</h2>

            <h3 className="text-xl font-semibold text-black mb-3">3.1 Essential Cookies</h3>
            <p className="text-gray-700 mb-4">
              These cookies are necessary for the Service to function and cannot be disabled. They include:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Authentication cookies:</strong> Keep you logged in</li>
              <li><strong>Security cookies:</strong> Detect and prevent security threats</li>
              <li><strong>Session cookies:</strong> Remember your actions during a browsing session</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-3">3.2 Functional Cookies</h3>
            <p className="text-gray-700 mb-4">
              These cookies enable enhanced functionality and personalization:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Interface cookies:</strong> Remember your chosen interface mode (Simple vs Advanced)</li>
              <li><strong>Language cookies:</strong> Remember your language preference</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-3">3.3 Analytics Cookies</h3>
            <p className="text-gray-700 mb-4">
              These cookies help us understand how visitors interact with our Service:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Usage tracking:</strong> Collect data about which features are used</li>
              <li><strong>Performance monitoring:</strong> Track page load times and errors</li>
              <li><strong>A/B testing:</strong> Test different versions of features</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-3">3.4 Third-Party Cookies</h3>
            <p className="text-gray-700 mb-4">
              We may use third-party services that set their own cookies:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Supabase:</strong> Authentication and database services</li>
              <li><strong>Analytics providers:</strong> Usage analytics and reporting</li>
              <li><strong>Payment processors:</strong> Payment processing and fraud prevention</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">4. Cookie Duration</h2>
            <h3 className="text-xl font-semibold text-black mb-3">4.1 Session Cookies</h3>
            <p className="text-gray-700 mb-4">
              These cookies are temporary and are deleted when you close your browser.
            </p>

            <h3 className="text-xl font-semibold text-black mb-3">4.2 Persistent Cookies</h3>
            <p className="text-gray-700">
              These cookies remain on your device for a set period or until you delete them. They remember your preferences across multiple sessions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">5. Managing Cookies</h2>
            <p className="text-gray-700 mb-4">
              You can control and manage cookies in several ways:
            </p>

            <h3 className="text-xl font-semibold text-black mb-3">5.1 Browser Settings</h3>
            <p className="text-gray-700 mb-4">
              Most browsers allow you to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>View what cookies are stored and delete them individually</li>
              <li>Block third-party cookies</li>
              <li>Block all cookies from specific websites</li>
              <li>Block all cookies from all websites</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-3">5.2 Browser-Specific Instructions</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Preferences → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
              <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies and site permissions</li>
            </ul>

            <p className="text-gray-700 mt-4">
              Note: Blocking or deleting cookies may affect your ability to use certain features of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">6. Do Not Track Signals</h2>
            <p className="text-gray-700">
              Some browsers include a "Do Not Track" (DNT) feature that signals websites you visit that you do not want to have your online activity tracked. We currently do not respond to DNT signals as there is no industry standard for how to interpret them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">7. Updates to This Policy</h2>
            <p className="text-gray-700">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will post the updated policy on this page with a revised "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">8. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about our use of cookies, please contact us:
            </p>
            <ul className="list-none text-gray-700 space-y-2">
              <li>Email: privacy@aimarketinghub.com</li>
              <li>Address: [Your Business Address]</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">9. More Information</h2>
            <p className="text-gray-700 mb-4">
              For more information about cookies and how they work, visit:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">allaboutcookies.org</a></li>
              <li><a href="https://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">youronlinechoices.com</a></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;

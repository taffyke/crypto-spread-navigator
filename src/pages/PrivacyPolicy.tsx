import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl text-white">Privacy Policy</CardTitle>
          <CardDescription className="text-slate-400">
            Last updated: April 15, 2024
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-slate-300 text-sm">
          <div>
            <h2 className="text-lg font-medium text-white mb-2">1. Introduction</h2>
            <p>
              Crypto Spread Navigator ("we", "our", or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, and share information about you when you 
              use our services, including our website and trading platform.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-white mb-2">2. Information We Collect</h2>
            <p className="mb-2">
              We collect information in the following ways:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Information you provide to us:</strong> We collect information you provide directly to us, 
                such as when you create an account, update your profile, use interactive features, 
                connect exchange APIs, or contact us for support.
              </li>
              <li>
                <strong>Information we collect automatically:</strong> When you use our services, we automatically 
                collect certain information, including log data, device information, usage data, and cookies.
              </li>
              <li>
                <strong>Information from third parties:</strong> We may receive information about you from 
                third parties, such as crypto exchanges when you connect their APIs to our platform.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-medium text-white mb-2">3. How We Use Your Information</h2>
            <p className="mb-2">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices, updates, security alerts, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Develop new products and services</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, investigate, and prevent fraudulent transactions and unauthorized access</li>
              <li>Personalize your experience</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-medium text-white mb-2">4. Data Security</h2>
            <p>
              We take reasonable measures to help protect your personal information from loss, theft, 
              misuse, unauthorized access, disclosure, alteration, and destruction. However, no security 
              system is impenetrable and we cannot guarantee the security of our systems 100%.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-white mb-2">5. Your Choices</h2>
            <p>
              You can access and update certain information about you from within your account settings. 
              You can also request deletion of your personal information by contacting us. 
              Note that we may retain certain information as required by law or for legitimate business purposes.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-white mb-2">6. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. If we make material changes, 
              we will notify you through our services or by other means.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-white mb-2">7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at: 
              <a href="mailto:privacy@cryptospreadnavigator.com" className="text-blue-400 ml-1 hover:underline">
                privacy@cryptospreadnavigator.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicy; 
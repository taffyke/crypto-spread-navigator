import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl text-white">Terms of Service</CardTitle>
          <CardDescription className="text-slate-400">
            Last updated: April 15, 2024
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-slate-300 text-sm">
          <div>
            <h2 className="text-lg font-medium text-white mb-2">1. Agreement to Terms</h2>
            <p>
              By accessing or using the Crypto Spread Navigator platform, you agree to be bound by these Terms of Service. 
              If you do not agree to these Terms, you may not access or use our services.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-white mb-2">2. Services</h2>
            <p className="mb-2">
              Crypto Spread Navigator provides tools for tracking, analyzing, and potentially executing cryptocurrency 
              arbitrage opportunities across different exchanges. Our services include:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Arbitrage opportunity scanning and identification</li>
              <li>Portfolio management and performance tracking</li>
              <li>Cryptocurrency exchange data integration</li>
              <li>Risk analysis and management tools</li>
              <li>Price alerts and notifications</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-medium text-white mb-2">3. Account Registration</h2>
            <p>
              To use certain features of our platform, you must register for an account. You agree to provide accurate, 
              current, and complete information during the registration process and to update such information to keep 
              it accurate, current, and complete. You are responsible for safeguarding your password and for all activities 
              that occur under your account.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-white mb-2">4. User Conduct</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use our services for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to any part of our services</li>
              <li>Interfere with or disrupt the integrity or performance of our services</li>
              <li>Use automated means to access or use our services</li>
              <li>Impersonate any person or entity</li>
              <li>Collect or harvest any information from our services</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-medium text-white mb-2">5. Exchange APIs and Trading</h2>
            <p>
              When you connect exchange APIs to our platform, you authorize us to access your exchange accounts as permitted 
              by the API permissions you grant. We do not store your API secrets on our servers in a way that would allow our 
              staff to access your funds. You acknowledge that cryptocurrency trading involves risk, and we are not responsible 
              for any losses you may incur from trading.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-white mb-2">6. Intellectual Property</h2>
            <p>
              Our platform and its content, features, and functionality are owned by Crypto Spread Navigator and are protected 
              by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, sell, or lease 
              any part of our services without our explicit permission.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-white mb-2">7. Disclaimer of Warranties</h2>
            <p>
              OUR SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. 
              WE DO NOT GUARANTEE THE ACCURACY, COMPLETENESS, OR USEFULNESS OF ANY INFORMATION ON OUR PLATFORM AND 
              WILL NOT BE LIABLE FOR ANY LOSSES OR DAMAGES THAT MAY RESULT FROM ITS USE.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-white mb-2">8. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CRYPTO SPREAD NAVIGATOR SHALL NOT BE LIABLE FOR ANY INDIRECT, 
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES RESULTING FROM YOUR ACCESS TO OR USE OF, 
              OR INABILITY TO ACCESS OR USE, OUR SERVICES.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-white mb-2">9. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. If we make material changes, we will notify you through our platform 
              or by other means. Your continued use of our services after such notification constitutes acceptance of the updated Terms.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-white mb-2">10. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which 
              Crypto Spread Navigator is established, without regard to its conflict of law provisions.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-white mb-2">11. Contact Information</h2>
            <p>
              For questions about these Terms, please contact us at: 
              <a href="mailto:legal@cryptospreadnavigator.com" className="text-blue-400 ml-1 hover:underline">
                legal@cryptospreadnavigator.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsOfService; 
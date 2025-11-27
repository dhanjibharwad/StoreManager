/* eslint-disable */
'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-gray-900 text-center tracking-tight">Privacy Policy</h1>
          <p className="mt-3 text-center text-base text-gray-500">Last updated: November 05, 2025</p>
        </div>
      </header>

      <main className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg prose prose-lg max-w-none">
            <p>
              Store Manager ("us", "we", or "our") operates the Store Manager website (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            </p>
            <p>
              We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy. Unless otherwise defined in this Privacy Policy, terms used in this Privacy Policy have the same meanings as in our Terms and Conditions, accessible from{' '}
              <Link href="/user/terms" className="text-sky-600 hover:text-sky-700 underline">
                /user/terms
              </Link>.
            </p>

            <h2 className="font-bold">1. Information Collection and Use</h2>
            <p>
              We collect several different types of information for various purposes to provide and improve our Service to you.
            </p>
            <h3>Types of Data Collected</h3>
            <h4>Personal Data</h4>
            <p>
              While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to:
            </p>
            <ul>
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Phone number</li>
              <li>Address, State, Province, ZIP/Postal code, City</li>
              <li>Cookies and Usage Data</li>
            </ul>

            <h4>Usage Data</h4>
            <p>
              We may also collect information on how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.
            </p>

            <h2 className="font-bold">2. Use of Data</h2>
            <p>Union Enterprise uses the collected data for various purposes:</p>
            <ul>
              <li>To provide and maintain the Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
              <li>To provide customer care and support</li>
              <li>To provide analysis or valuable information so that we can improve the Service</li>
              <li>To monitor the usage of the Service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>

            <h2 className="font-bold">3. Transfer Of Data</h2>
            <p>
              Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.
            </p>
            <p>
              If you are located outside our jurisdiction and choose to provide information to us, please note that we transfer the data, including Personal Data, to our jurisdiction and process it there. Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.
            </p>

            <h2 className="font-bold">4. Disclosure Of Data</h2>
            <p>
              Union Enterprise may disclose your Personal Data in the good faith belief that such action is necessary to:
            </p>
            <ul>
              <li>To comply with a legal obligation</li>
              <li>To protect and defend the rights or property of Union Enterprise</li>
              <li>To prevent or investigate possible wrongdoing in connection with the Service</li>
              <li>To protect the personal safety of users of the Service or the public</li>
              <li>To protect against legal liability</li>
            </ul>

            <h2 className="font-bold">5. Security Of Data</h2>
            <p>
              The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>

            <h2 className="font-bold">6. Your Data Protection Rights</h2>
            <p>
              Union Enterprise aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data. If you wish to be informed what Personal Data we hold about you and if you want it to be removed from our systems, please contact us.
            </p>

            <h2 className="font-bold">7. Service Providers</h2>
            <p>
              We may employ third party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>

            <h2 className="font-bold">8. Links To Other Sites</h2>
            <p>
              Our Service may contain links to other sites that are not operated by us. If you click on a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.
            </p>

            <h2 className="font-bold">9. Children's Privacy</h2>
            <p>
              Our Service does not address anyone under the age of 18 ("Children"). We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your Children has provided us with Personal Data, please contact us.
            </p>

            <h2 className="font-bold">10. Changes To This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the "last updated" date at the top of this Privacy Policy.
            </p>

            <h2 className="font-bold">11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us. You can reach us via our{' '}
              <Link href="/user/contact" className="text-sky-600 hover:text-sky-700 underline">
                Contact Page
              </Link>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
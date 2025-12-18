'use client'

import {
  AlertCircle,
  Building,
  FileText,
  Scale,
  Shield,
  UserCheck,
} from 'lucide-react'

export default function TermsOfServicePage() {
  const lastUpdated = 'December 15, 2024'

  const userTypes = [
    {
      type: 'Buyers/Tenants',
      description: 'Individuals seeking to purchase or rent properties',
      obligations: [
        'Provide accurate information',
        'Conduct due diligence',
        'Make timely payments',
      ],
    },
    {
      type: 'Sellers/Landlords',
      description: 'Property owners listing properties for sale or rent',
      obligations: [
        'Provide truthful property information',
        'Maintain listing accuracy',
        'Honor agreements',
      ],
    },
    {
      type: 'Agents',
      description: 'Licensed real estate professionals',
      obligations: [
        'Maintain professional standards',
        'Disclose conflicts of interest',
        'Protect client information',
      ],
    },
    {
      type: 'Developers',
      description: 'Property developers and builders',
      obligations: [
        'Provide accurate project details',
        'Meet legal requirements',
        'Honor warranties',
      ],
    },
  ]

  const prohibitedActivities = [
    'Providing false or misleading information about properties',
    'Attempting to bypass our verification processes',
    'Engaging in fraudulent activities or scams',
    'Violating Nigerian real estate laws and regulations',
    'Harassing or threatening other users',
    'Uploading malicious software or viruses',
    'Infringing intellectual property rights',
    'Circumventing payment systems',
  ]

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="bg-linear-to-r from-emerald-600 to-emerald-700 text-white py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex p-4 bg-white/10 rounded-2xl mb-6">
              <Scale className="h-12 w-12" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-blue-100 mb-4">
              Legal agreement governing your use of PropSafe Hub services
            </p>
            <div className="text-blue-200 text-sm">
              Effective Date: {lastUpdated}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl py-16">
        <div className="bg-white rounded-2xl border shadow-lg p-8 mb-12">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Important Notice
              </h3>
              <p className="text-gray-700">
                By accessing or using PropSafe Hub&apos;s services, you agree to
                be bound by these Terms of Service. Please read them carefully.
                If you disagree with any part of these terms, you may not access
                our services.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {/* Agreement */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Agreement to Terms
            </h2>
            <div className="prose prose-lg text-gray-700 max-w-none">
              <p>
                These Terms of Service (&quot;Terms&quot;) constitute a legally
                binding agreement made between you (&quot;User&quot;) and
                PropSafe Hub Limited (&quot;Company,&quot; &quot;we,&quot;
                &quot;us,&quot; or &quot;our&quot;), concerning your access to
                and use of our real estate platform, services, and applications.
              </p>
              <p className="mt-4">
                These Terms apply to all visitors, users, and others who wish to
                access or use our Services.
              </p>
            </div>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              2. User Accounts and Registration
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">
                    Account Creation
                  </h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>• You must provide accurate and complete information</li>
                  <li>• You must be at least 18 years old</li>
                  <li>
                    • You are responsible for maintaining account security
                  </li>
                  <li>• You must notify us of any unauthorized access</li>
                </ul>
              </div>
              <div className="bg-amber-50 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-amber-600" />
                  <h3 className="font-semibold text-gray-900">
                    Account Responsibilities
                  </h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>• Keep your password confidential</li>
                  <li>• Do not share account access</li>
                  <li>• Update information promptly</li>
                  <li>• Accept responsibility for all activities</li>
                </ul>
              </div>
            </div>
          </section>

          {/* User Types */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              3. User Types and Obligations
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {userTypes.map((user, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl border">
                  <div className="flex items-center gap-3 mb-4">
                    <Building className="h-6 w-6 text-emerald-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {user.type}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {user.description}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      Key Obligations:
                    </div>
                    {user.obligations.map((obligation, oIdx) => (
                      <div
                        key={oIdx}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                        {obligation}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Services Description */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Services Description
            </h2>
            <div className="prose prose-lg text-gray-700 max-w-none">
              <p>PropSafe Hub provides the following services:</p>
              <ul className="mt-4 space-y-3">
                <li>
                  <strong>Property Listings:</strong> Platform for listing and
                  discovering verified properties
                </li>
                <li>
                  <strong>Verification Services:</strong> Due diligence and
                  property verification
                </li>
                <li>
                  <strong>Advisory Services:</strong> Real estate investment
                  guidance
                </li>
                <li>
                  <strong>Transaction Support:</strong> Assistance with property
                  transactions
                </li>
                <li>
                  <strong>Document Management:</strong> Secure document storage
                  and processing
                </li>
                <li>
                  <strong>Market Intelligence:</strong> Real estate market data
                  and insights
                </li>
              </ul>
              <p className="mt-6">
                <strong>Disclaimer:</strong> We are a technology platform, not a
                real estate broker, agent, or financial advisor. We facilitate
                connections but do not guarantee transaction outcomes.
              </p>
            </div>
          </section>

          {/* Prohibited Activities */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              5. Prohibited Activities
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <h3 className="font-semibold text-red-900">
                  Activities Not Permitted
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {prohibitedActivities.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 shrink-0"></div>
                    <span className="text-sm text-gray-700">{activity}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Consequences:</strong> Violation of these prohibitions
                  may result in account suspension, legal action, and reporting
                  to appropriate authorities.
                </p>
              </div>
            </div>
          </section>

          {/* Fees and Payments */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Fees and Payments
            </h2>
            <div className="prose prose-lg text-gray-700 max-w-none">
              <p>Certain services may require payment of fees:</p>
              <ul className="mt-4 space-y-3">
                <li>
                  <strong>Service Fees:</strong> Specific fees apply to
                  verification, advisory, and premium services
                </li>
                <li>
                  <strong>Transaction Fees:</strong> May apply to successful
                  property transactions
                </li>
                <li>
                  <strong>Subscription Fees:</strong> For premium features or
                  agent accounts
                </li>
              </ul>
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 my-6">
                <p className="text-emerald-800">
                  <strong>
                    All fees are displayed in Nigerian Naira (₦). Taxes and
                    additional charges may apply.
                  </strong>
                </p>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Intellectual Property
            </h2>
            <div className="prose prose-lg text-gray-700 max-w-none">
              <p>
                The Service and its original content, features, and
                functionality are owned by PropSafe Hub and are protected by
                international copyright, trademark, and other intellectual
                property laws.
              </p>
              <p className="mt-4">
                You may not reproduce, distribute, modify, create derivative
                works of, publicly display, publicly perform, republish,
                download, store, or transmit any of our proprietary material.
              </p>
            </div>
          </section>

          {/* Disclaimer of Warranties */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. Disclaimer of Warranties
            </h2>
            <div className="prose prose-lg text-gray-700 max-w-none">
              <p>
                THE SERVICE IS PROVIDED ON AN &quot;AS-IS&quot; AND &quot;AS
                AVAILABLE&quot; BASIS. WE DISCLAIM ALL WARRANTIES OF ANY KIND,
                WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
                IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
                PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p className="mt-4">
                WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
                SECURE, OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT
                THE SERVICE IS FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              9. Limitation of Liability
            </h2>
            <div className="prose prose-lg text-gray-700 max-w-none">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT
                SHALL PROPSAFE HUB BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT
                LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER
                INTANGIBLE LOSSES.
              </p>
              <p className="mt-4">
                OUR TOTAL LIABILITY FOR ANY CLAIMS UNDER THESE TERMS SHALL NOT
                EXCEED THE AMOUNT YOU HAVE PAID TO US IN THE LAST SIX MONTHS, OR
                ONE HUNDRED THOUSAND NAIRA (₦100,000), WHICHEVER IS GREATER.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              10. Governing Law
            </h2>
            <div className="prose prose-lg text-gray-700 max-w-none">
              <p>
                These Terms shall be governed and construed in accordance with
                the laws of the Federal Republic of Nigeria, without regard to
                its conflict of law provisions.
              </p>
              <p className="mt-4">
                Any disputes arising from these Terms or your use of our
                Services shall be subject to the exclusive jurisdiction of the
                courts of Lagos State, Nigeria.
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              11. Changes to Terms
            </h2>
            <div className="prose prose-lg text-gray-700 max-w-none">
              <p>
                We reserve the right, at our sole discretion, to modify or
                replace these Terms at any time. We will provide notice of
                material changes by posting the updated Terms on our platform.
              </p>
              <p className="mt-4">
                By continuing to access or use our Service after those revisions
                become effective, you agree to be bound by the revised terms.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              12. Contact Information
            </h2>
            <div className="bg-white p-8 rounded-xl border shadow-sm">
              <p className="text-gray-700 mb-6">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Legal Department
                  </h4>
                  <div className="space-y-2 text-gray-600">
                    <p>Email: legal@propsafehub.com</p>
                    <p>Phone: +234 704 800 0553</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Registered Address
                  </h4>
                  <p className="text-gray-600">
                    50, Emerald Avenue, Monastery Road
                    <br />
                    Sangotedo, Ajah, Lagos
                    <br />
                    Nigeria
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Acceptance */}
          <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white text-center">
            <h3 className="text-xl font-bold mb-4">Acceptance of Terms</h3>
            <p className="mb-6 text-blue-100">
              By using PropSafe Hub services, you acknowledge that you have
              read, understood, and agree to be bound by these Terms of Service.
            </p>
            <div className="flex items-center justify-center gap-4">
              <FileText className="h-6 w-6" />
              <span className="font-medium">Last Updated: {lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

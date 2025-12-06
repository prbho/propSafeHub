'use client'

import Link from 'next/link'
import {
  CheckCircle,
  Eye,
  FileText,
  Lock,
  Mail,
  Shield,
  User,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function PrivacyPolicyPage() {
  const lastUpdated = 'December 15, 2024'

  const dataTypes = [
    {
      category: 'Personal Information',
      examples: [
        'Name, email, phone number',
        'Date of birth, gender',
        'Address, nationality',
      ],
      purpose: 'Account creation, verification, communication',
    },
    {
      category: 'Property Information',
      examples: [
        'Property details you list or inquire about',
        'Verification documents',
        'Transaction history',
      ],
      purpose: 'Property matching, due diligence, transaction processing',
    },
    {
      category: 'Financial Information',
      examples: [
        'Payment details for services',
        'Income information for mortgage applications',
        'Tax identification numbers',
      ],
      purpose: 'Service payments, mortgage qualification, legal compliance',
    },
    {
      category: 'Technical Information',
      examples: [
        'IP address, browser type',
        'Device information',
        'Usage patterns on our platform',
      ],
      purpose: 'Security, analytics, platform improvement',
    },
  ]

  const rights = [
    {
      title: 'Access Your Data',
      description: 'Request a copy of personal data we hold about you',
    },
    {
      title: 'Correction Rights',
      description: 'Request correction of inaccurate or incomplete data',
    },
    {
      title: 'Deletion Rights',
      description:
        'Request deletion of your personal data under certain conditions',
    },
    {
      title: 'Object to Processing',
      description: 'Object to our processing of your personal data',
    },
    {
      title: 'Data Portability',
      description: 'Receive your data in a structured, machine-readable format',
    },
    {
      title: 'Withdraw Consent',
      description:
        'Withdraw consent at any time where processing is based on consent',
    },
  ]

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="bg-linear-to-r from-emerald-600 to-emerald-700 text-white py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex p-4 bg-white/10 rounded-2xl mb-6">
              <Shield className="h-12 w-12" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-emerald-100 mb-4">
              Your trust is our priority. Learn how we protect and handle your
              information.
            </p>
            <div className="text-emerald-200 text-sm">
              Last Updated: {lastUpdated}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl py-16">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-xl p-6 border shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">
                Table of Contents
              </h3>
              <nav className="space-y-2">
                {[
                  'Introduction',
                  'Information We Collect',
                  'How We Use Your Information',
                  'Data Sharing',
                  'Your Rights',
                  'Data Security',
                  'Cookies & Tracking',
                  "Children's Privacy",
                  'Changes to Policy',
                  'Contact Us',
                ].map((item, idx) => (
                  <a
                    key={idx}
                    href={`#${item
                      .toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^\w-]/g, '')}`}
                    className="block text-sm text-gray-600 hover:text-emerald-600 hover:pl-2 transition-all"
                  >
                    {item}
                  </a>
                ))}
              </nav>
              <div className="mt-8 pt-6 border-t border-gray-200">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/contact">Questions? Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Introduction */}
            <section id="introduction">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Introduction
              </h2>
              <div className="prose prose-lg text-gray-700 max-w-none">
                <p>
                  PropSafe Hub (&quot;we,&quot; &quot;our,&quot; or
                  &quot;us&quot;) is committed to protecting your privacy. This
                  Privacy Policy explains how we collect, use, disclose, and
                  safeguard your information when you use our real estate
                  platform and services.
                </p>
                <p className="mt-4">
                  We operate in compliance with Nigerian data protection laws,
                  including the Nigeria Data Protection Regulation (NDPR), and
                  international best practices for data privacy.
                </p>
                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 my-6">
                  <p className="text-emerald-800 font-medium">
                    <strong>Scope:</strong> This policy applies to all users of
                    PropSafe Hub services, including property buyers, sellers,
                    agents, developers, and visitors to our website.
                  </p>
                </div>
              </div>
            </section>

            {/* Information We Collect */}
            <section id="information-we-collect">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                2. Information We Collect
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {dataTypes.map((type, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl border">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {type.category}
                    </h3>
                    <ul className="space-y-2 mb-4">
                      {type.examples.map((example, eIdx) => (
                        <li
                          key={eIdx}
                          className="flex items-center text-sm text-gray-600"
                        >
                          <CheckCircle className="h-3 w-3 text-emerald-500 mr-2 shrink-0" />
                          {example}
                        </li>
                      ))}
                    </ul>
                    <div className="text-xs text-gray-500">
                      <strong>Purpose:</strong> {type.purpose}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Collection Methods
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <User className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                    <div className="text-sm font-medium">Direct Input</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <FileText className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                    <div className="text-sm font-medium">Document Upload</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <Eye className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                    <div className="text-sm font-medium">Platform Usage</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <Mail className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                    <div className="text-sm font-medium">Communication</div>
                  </div>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section id="how-we-use-your-information">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. How We Use Your Information
              </h2>
              <div className="prose prose-lg text-gray-700 max-w-none">
                <p>
                  We use your information for legitimate business purposes,
                  including:
                </p>
                <ul className="mt-4 space-y-3">
                  <li>
                    <strong>Service Provision:</strong> To provide and maintain
                    our real estate services, including property verification,
                    advisory, and transaction facilitation.
                  </li>
                  <li>
                    <strong>Property Verification:</strong> To conduct due
                    diligence on properties, which may include sharing
                    verification requests with third-party experts.
                  </li>
                  <li>
                    <strong>Communication:</strong> To send service-related
                    communications, property updates, and respond to inquiries.
                  </li>
                  <li>
                    <strong>Legal Compliance:</strong> To comply with Nigerian
                    real estate laws, anti-money laundering regulations, and tax
                    requirements.
                  </li>
                  <li>
                    <strong>Platform Improvement:</strong> To analyze usage
                    patterns and improve our services.
                  </li>
                  <li>
                    <strong>Marketing:</strong> To send promotional materials
                    about our services (with your consent where required).
                  </li>
                </ul>
              </div>
            </section>

            {/* Data Sharing */}
            <section id="data-sharing">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Data Sharing
              </h2>
              <div className="prose prose-lg text-gray-700 max-w-none">
                <p>We may share your information with:</p>
                <ul className="mt-4 space-y-3">
                  <li>
                    <strong>Service Providers:</strong> Third-party vendors who
                    assist in property verification, payment processing, or
                    technical support.
                  </li>
                  <li>
                    <strong>Legal Authorities:</strong> When required by law or
                    to protect our legal rights.
                  </li>
                  <li>
                    <strong>Business Partners:</strong> Mortgage providers,
                    developers, or agents involved in your transaction.
                  </li>
                  <li>
                    <strong>Other Users:</strong> Limited information with other
                    platform users as necessary for transactions.
                  </li>
                </ul>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6">
                  <p className="text-yellow-800">
                    <strong>Note:</strong> We never sell your personal
                    information to third parties for marketing purposes.
                  </p>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section id="your-rights">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                5. Your Data Protection Rights
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rights.map((right, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        {right.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">{right.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-6 bg-emerald-50 rounded-xl">
                <p className="text-emerald-800">
                  To exercise any of these rights, please contact us at{' '}
                  <a
                    href="mailto:privacy@propsafehub.com"
                    className="font-semibold underline"
                  >
                    privacy@propsafehub.com
                  </a>
                  . We will respond within 30 days as required by law.
                </p>
              </div>
            </section>

            {/* Data Security */}
            <section id="data-security">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Data Security
              </h2>
              <div className="prose prose-lg text-gray-700 max-w-none">
                <div className="flex items-start gap-4 mb-6">
                  <Lock className="h-8 w-8 text-emerald-600 shrink-0" />
                  <div>
                    <p>
                      We implement appropriate technical and organizational
                      security measures to protect your personal data against
                      unauthorized access, alteration, disclosure, or
                      destruction.
                    </p>
                    <p className="mt-3">
                      Our security measures include encryption, secure servers,
                      access controls, and regular security assessments.
                      However, no method of transmission over the Internet or
                      electronic storage is 100% secure.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Cookies & Tracking */}
            <section id="cookies-tracking">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Cookies & Tracking Technologies
              </h2>
              <div className="prose prose-lg text-gray-700 max-w-none">
                <p>
                  We use cookies and similar tracking technologies to track
                  activity on our platform and hold certain information. You can
                  control cookies through your browser settings.
                </p>
                <p className="mt-4">
                  For detailed information about the cookies we use and your
                  choices regarding cookies, please visit our{' '}
                  <Link
                    href="/cookies"
                    className="text-emerald-600 font-semibold"
                  >
                    Cookie Policy
                  </Link>
                  .
                </p>
              </div>
            </section>

            {/* Children's Privacy */}
            <section id="childrens-privacy">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. Children&apos;s Privacy
              </h2>
              <div className="prose prose-lg text-gray-700 max-w-none">
                <p>
                  Our services are not directed to individuals under 18. We do
                  not knowingly collect personal information from children under
                  18. If you become aware that a child has provided us with
                  personal information, please contact us immediately.
                </p>
              </div>
            </section>

            {/* Changes to Policy */}
            <section id="changes-to-policy">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. Changes to This Privacy Policy
              </h2>
              <div className="prose prose-lg text-gray-700 max-w-none">
                <p>
                  We may update this Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page and updating the &quot;Last Updated&quot; date.
                </p>
                <p className="mt-4">
                  You are advised to review this Privacy Policy periodically for
                  any changes. Changes to this Privacy Policy are effective when
                  they are posted on this page.
                </p>
              </div>
            </section>

            {/* Contact Us */}
            <section id="contact-us">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                10. Contact Us
              </h2>
              <div className="bg-white p-8 rounded-xl border shadow-sm">
                <p className="text-gray-700 mb-4">
                  If you have any questions about this Privacy Policy or our
                  data practices, please contact us:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-emerald-600" />
                    <span className="text-gray-700">
                      Email: privacy@propsafehub.com
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-emerald-600" />
                    <span className="text-gray-700">
                      General: propsafehub@gmail.com
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    <span className="text-gray-700">
                      Address: 50, Emerald Avenue, Monastery Road, Sangotedo,
                      Ajah, Lagos
                    </span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Data Protection Officer:</strong> Our Data
                    Protection Officer can be reached at dpo@propsafehub.com for
                    privacy-specific concerns.
                  </p>
                </div>
              </div>
            </section>

            {/* Bottom CTA */}
            <div className="bg-linear-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white text-center">
              <h3 className="text-xl font-bold mb-4">Have Privacy Concerns?</h3>
              <p className="mb-6 text-emerald-100">
                Our team is ready to address any questions about your data
                privacy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  className="bg-white text-emerald-700 hover:bg-gray-100"
                >
                  <a href="mailto:privacy@propsafehub.com">
                    Email Privacy Team
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white bg-transparent text-white hover:bg-white/10"
                >
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

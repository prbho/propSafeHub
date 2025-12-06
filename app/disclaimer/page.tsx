'use client'

import {
  AlertTriangle,
  Building,
  FileText,
  Scale,
  Shield,
  TrendingUp,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="bg-linear-to-r from-emerald-600 to-emerald-700 text-white py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex p-4 bg-white/10 rounded-2xl mb-6">
              <AlertTriangle className="h-12 w-12" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              Legal Disclaimer
            </h1>
            <p className="text-xl text-emerald-100">
              Important information about the limitations of our services
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl py-16">
        <div className="space-y-12">
          {/* Important Notice */}
          <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-r-xl">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-8 w-8 text-red-600 shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-red-900 mb-4">
                  Important Notice
                </h2>
                <p className="text-red-800">
                  This disclaimer contains important information about the
                  limitations of our services. By using PropSafe Hub&apos;s
                  platform and services, you acknowledge and agree to these
                  terms.
                </p>
              </div>
            </div>
          </div>

          {/* General Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. General Information Disclaimer
            </h2>
            <div className="prose prose-lg text-gray-700 max-w-none">
              <p>
                The information provided on PropSafe Hub&apos;s platform is for
                general informational purposes only. While we strive to keep the
                information up-to-date and correct, we make no representations
                or warranties of any kind, express or implied, about the
                completeness, accuracy, reliability, suitability, or
                availability with respect to the platform or the information,
                products, services, or related graphics contained on the
                platform for any purpose.
              </p>
            </div>
          </section>

          {/* Not Professional Advice */}
          <section>
            <div className="bg-white rounded-xl border p-8">
              <div className="flex items-center gap-4 mb-6">
                <Scale className="h-8 w-8 text-amber-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  2. Not Professional Advice
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    What We Provide
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>Property verification services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Building className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>Real estate market information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>Investment insights and data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>Platform for property listings</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    What We Are Not
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                      <span>A licensed real estate broker or agent</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                      <span>A financial advisor or investment advisor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                      <span>A legal services provider</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                      <span>A property appraiser or valuer</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 p-6 bg-amber-50 rounded-lg">
                <p className="text-amber-800">
                  <strong>Important:</strong> You should consult with
                  appropriate licensed professionals (real estate attorneys,
                  financial advisors, certified appraisers) before making any
                  real estate investment decisions.
                </p>
              </div>
            </div>
          </section>

          {/* Verification Services Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Property Verification Disclaimer
            </h2>
            <div className="prose prose-lg text-gray-700 max-w-none">
              <p>
                Our property verification services are based on due diligence
                and reasonable efforts to verify property information. However:
              </p>
              <ul className="mt-4 space-y-3">
                <li>
                  We cannot guarantee the absolute accuracy of all property
                  information
                </li>
                <li>
                  Verification results are based on information available at the
                  time of verification
                </li>
                <li>
                  We are not responsible for changes in property status after
                  verification
                </li>
                <li>
                  Our verification does not constitute legal advice or a
                  guarantee of property ownership
                </li>
                <li>
                  We are not liable for fraudulent documents that pass initial
                  verification
                </li>
              </ul>
            </div>
          </section>

          {/* Investment Risk Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              4. Investment Risk Disclaimer
            </h2>
            <div className="bg-white rounded-xl border p-8">
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Real Estate Investment Risks
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="font-medium text-red-900 mb-1">
                        Market Risk
                      </div>
                      <p className="text-sm text-red-700">
                        Property values can decrease
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="font-medium text-red-900 mb-1">
                        Legal Risk
                      </div>
                      <p className="text-sm text-red-700">
                        Title disputes and legal issues
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="font-medium text-red-900 mb-1">
                        Liquidity Risk
                      </div>
                      <p className="text-sm text-red-700">
                        Real estate is not easily convertible to cash
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="font-medium text-red-900 mb-1">
                        Development Risk
                      </div>
                      <p className="text-sm text-red-700">
                        Construction delays and cost overruns
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700">
                  <strong>Investment Decisions:</strong> All investment
                  decisions are solely your responsibility. Past performance of
                  real estate investments does not guarantee future results. You
                  should only invest money that you can afford to lose.
                </p>
              </div>
            </div>
          </section>

          {/* Third-Party Content */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Third-Party Content and Links
            </h2>
            <div className="prose prose-lg text-gray-700 max-w-none">
              <p>
                Our platform may contain links to external websites that are not
                provided or maintained by or in any way affiliated with PropSafe
                Hub. Please note that we do not guarantee the accuracy,
                relevance, timeliness, or completeness of any information on
                these external websites.
              </p>
              <p className="mt-4">
                The inclusion of any links does not necessarily imply a
                recommendation or endorse the views expressed within them.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Limitation of Liability
            </h2>
            <div className="prose prose-lg text-gray-700 max-w-none">
              <p>
                In no event shall PropSafe Hub be liable for any loss or damage
                including without limitation, indirect or consequential loss or
                damage, or any loss or damage whatsoever arising from loss of
                data or profits arising out of, or in connection with, the use
                of our platform and services.
              </p>
              <p className="mt-4">
                Through this platform you are able to link to other websites
                which are not under the control of PropSafe Hub. We have no
                control over the nature, content and availability of those
                sites.
              </p>
            </div>
          </section>

          {/* Nigerian Law Specific */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Nigerian Real Estate Specific Disclaimers
            </h2>
            <div className="prose prose-lg text-gray-700 max-w-none">
              <p>
                In the context of Nigerian real estate, please be aware of the
                following additional risks:
              </p>
              <ul className="mt-4 space-y-3">
                <li>
                  <strong>Omo-Onile Issues:</strong> Potential land ownership
                  disputes with family members
                </li>
                <li>
                  <strong>Government Acquisition:</strong> Risk of properties
                  being on government-acquired land
                </li>
                <li>
                  <strong>Document Fraud:</strong> Prevalence of fraudulent land
                  documents in Nigeria
                </li>
                <li>
                  <strong>Community Disputes:</strong> Potential conflicts with
                  local communities
                </li>
                <li>
                  <strong>Infrastructure Risks:</strong> Variable access to
                  utilities and roads
                </li>
                <li>
                  <strong>Regulatory Changes:</strong> Frequent changes in real
                  estate regulations and policies
                </li>
              </ul>
            </div>
          </section>

          {/* User Responsibility */}
          <section>
            <div className="bg-linear-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">
                8. User Responsibility
              </h2>
              <div className="space-y-4">
                <p>
                  As a user of PropSafe Hub services, you acknowledge and agree
                  that:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Shield className="h-5 w-5 mt-0.5 shrink-0" />
                    <span>
                      You are responsible for conducting your own due diligence
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="h-5 w-5 mt-0.5 shrink-0" />
                    <span>You should verify all information independently</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="h-5 w-5 mt-0.5 shrink-0" />
                    <span>
                      You must consult with professionals before making
                      decisions
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="h-5 w-5 mt-0.5 shrink-0" />
                    <span>
                      You assume all risks associated with real estate
                      transactions
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact for Clarification */}
          <section>
            <div className="bg-white rounded-xl border p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Need Clarification?
              </h2>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                If you have questions about this disclaimer or need
                clarification about any aspect of our services, please contact
                our legal team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-gray-900 hover:bg-gray-700">
                  <a href="mailto:legal@propsafehub.com">Contact Legal Team</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="tel:+2349023558992">Call for Clarification</a>
                </Button>
              </div>
            </div>
          </section>

          {/* Final Acknowledgment */}
          <div className="bg-gray-900 rounded-2xl p-8 text-white text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-6 text-amber-400" />
            <h3 className="text-xl font-bold mb-4">Final Acknowledgement</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              By using PropSafe Hub&apos;s services, you acknowledge that you
              have read, understood, and agree to be bound by this Disclaimer.
              If you do not agree with any part of this disclaimer, you must not
              use our services.
            </p>
            <p className="text-sm text-gray-400">
              This disclaimer is subject to change without notice and was last
              updated on December 15, 2024.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

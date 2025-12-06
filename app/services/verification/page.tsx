'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  CheckCircle,
  CheckCircle2Icon,
  ChevronRight,
  FileCheck,
  MapPin,
  Shield,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function PropertyVerificationPage() {
  const verificationSteps = [
    {
      step: 1,
      title: 'Document Collection',
      description: 'Submit all property documents for initial review',
      icon: FileCheck,
      details: [
        'Certificate of Occupancy',
        'Survey Plans',
        'Deed of Assignment',
        'Gazette/Excision',
      ],
    },
    {
      step: 2,
      title: 'Title Verification',
      description: 'Government registry checks and legal validation',
      icon: Shield,
      details: [
        'Land Bureau Verification',
        'Court Records Check',
        'Previous Transactions History',
      ],
    },
    {
      step: 3,
      title: 'Site Verification',
      description: 'Physical inspection and neighborhood assessment',
      icon: MapPin,
      details: [
        'Physical Inspection',
        'Boundary Confirmation',
        'Neighborhood Analysis',
        'Access Road Verification',
      ],
    },
    {
      step: 4,
      title: 'Risk Assessment',
      description: 'Comprehensive risk analysis and reporting',
      icon: AlertTriangle,
      details: [
        'Encumbrance Check',
        'Community Assessment',
        'Future Development Plans',
        'Red Flag Detection',
      ],
    },
    {
      step: 5,
      title: 'Final Report',
      description: 'Detailed verification certificate and recommendations',
      icon: CheckCircle,
      details: [
        'PropSafe Score™',
        'Risk Level Assessment',
        'Verification Certificate',
        'Investment Recommendation',
      ],
    },
  ]

  const verificationPackages = [
    {
      name: 'Standard Verification',
      price: '₦50,000',
      duration: '5-7 days',
      icon: Shield,
      features: [
        'Basic Document Authentication',
        'Land Bureau Verification',
        'Physical Site Inspection',
        'Encumbrance Check',
        'PropSafe Score™ Report',
        'Basic Risk Assessment',
      ],
      recommended: false,
    },
    {
      name: 'Premium Verification',
      price: '₦85,000',
      duration: '3-5 days',
      icon: CheckCircle,
      features: [
        'Comprehensive Document Review',
        'Full Government Registry Check',
        'Detailed Site Analysis',
        'Community & Omo-Onile Assessment',
        'Future Development Impact Study',
        'Legal Opinion & Recommendations',
        'Priority Processing',
        '1-Year Verification Validity',
      ],
      recommended: true,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-emerald-600 to-emerald-700 text-white py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              PropSafe Verify™
            </h1>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto mb-8">
              Protect your investment with our comprehensive property
              verification service. We conduct 360° due diligence to ensure zero
              hidden risks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-emerald-700 hover:bg-gray-100 px-8"
              >
                <Link href="#start-verification">Start Verification</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/schedule-meeting">Book Free Consultation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex gap-4">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 flex-1">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-12 w-12 text-red-600 shrink-0" />
                <div>
                  <h3 className="text-2xl font-bold text-red-900 mb-4">
                    The Reality of Nigerian Real Estate
                  </h3>
                  <div className="grid md:grid-cols-1 gap-6">
                    <div>
                      <h4 className="font-semibold text-red-800 mb-2">
                        Common Property Scams:
                      </h4>
                      <ul className="space-y-2 text-red-700">
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-2" /> Fake
                          Certificate of Occupancy
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-2" /> Double Land
                          Allocation
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-2" /> Government
                          Acquired Land Sales
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-2" /> Family Land
                          Disputes
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-800 mb-2">
                        Consequences:
                      </h4>
                      <ul className="space-y-2 text-red-700">
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-2" /> Complete
                          Loss of Investment
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-2" /> Legal
                          Battles & Stress
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-2" /> Demolition
                          by Authorities
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-2" /> Omo-Onile
                          Harassment
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-2xl p-8">
              <div className="mb-12">
                <div className="flex items-start gap-4">
                  <CheckCircle2Icon className="h-12 w-12 text-emerald-600 shrink-0" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 ">
                      Our 5-Step Verification Process
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      Every property undergoes rigorous checks by our team of
                      legal experts, surveyors, and real estate professionals.
                    </p>

                    <div className="space-y-8 mt-6">
                      {verificationSteps.map((step) => (
                        <div key={step.step} className="">
                          <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl">
                                <span className="text-2xl font-bold">
                                  {step.step}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {step.title}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                  {step.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {step.details.map((detail, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center text-gray-700 text-sm"
                                  >
                                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 shrink-0" />
                                    <span>{detail}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>{' '}
        </div>
      </section>

      {/* Verification Process */}
      <section className="py-16 bg-gray-50"></section>

      {/* Packages */}
      {/* <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Verification Package
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select the level of verification that matches your needs and
              budget.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {verificationPackages.map((pkg) => (
              <div
                key={pkg.name}
                className={`bg-white rounded-2xl p-8 border-2 ${pkg.recommended ? 'border-emerald-600 shadow-xl' : 'border-gray-200 shadow-lg'}`}
              >
                {pkg.recommended && (
                  <div className="inline-block bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
                    MOST POPULAR
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-3 ${pkg.recommended ? 'bg-emerald-100' : 'bg-blue-100'} rounded-lg`}
                  >
                    <pkg.icon
                      className={`h-6 w-6 ${pkg.recommended ? 'text-emerald-600' : 'text-blue-600'}`}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {pkg.name}
                  </h3>
                </div>

                <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-900">
                    {pkg.price}
                  </div>
                  <div className="text-gray-600 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {pkg.duration} processing time
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`w-full ${pkg.recommended ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  <Link
                    href={`/checkout?package=${pkg.name.toLowerCase().replace(' ', '-')}`}
                  >
                    Select Package <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: 'What documents do I need for verification?',
                a: "You'll need all available property documents including C of O, survey plans, deed of assignment, purchase receipt, and any government approvals. Our team will guide you through the complete list.",
              },
              {
                q: 'How long does verification take?',
                a: 'Standard verification takes 5-7 business days, while premium verification is completed in 3-5 business days. Complex cases may require additional time.',
              },
              {
                q: 'What happens if you find issues with the property?',
                a: "We provide a detailed report highlighting all issues, risks, and recommendations. You'll receive guidance on whether to proceed, renegotiate, or avoid the property entirely.",
              },
              {
                q: 'Can you verify properties outside Lagos?',
                a: 'Yes, we verify properties across Nigeria. Our network of professionals covers major cities and states nationwide.',
              },
              {
                q: 'Is the verification report legally binding?',
                a: 'Our report serves as professional due diligence and risk assessment. While not a legal document, it provides comprehensive analysis that can be used in legal proceedings.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.q}
                </h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, FileText, Percent, Shield, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'

export default function MortgageFinancingPage() {
  const [propertyPrice, setPropertyPrice] = useState(50000000)
  const [downPayment, setDownPayment] = useState(30)
  const [loanTerm, setLoanTerm] = useState(20)
  const [income, setIncome] = useState('')

  const calculateMortgage = () => {
    const loanAmount = propertyPrice * ((100 - downPayment) / 100)
    const annualInterest = 0.18 // 18% annual interest
    const monthlyInterest = annualInterest / 12
    const numberOfPayments = loanTerm * 12

    if (monthlyInterest === 0) {
      return loanAmount / numberOfPayments
    }

    const monthlyPayment =
      (loanAmount *
        (monthlyInterest * Math.pow(1 + monthlyInterest, numberOfPayments))) /
      (Math.pow(1 + monthlyInterest, numberOfPayments) - 1)

    return Math.round(monthlyPayment)
  }

  const monthlyPayment = calculateMortgage()
  const loanAmount = propertyPrice * ((100 - downPayment) / 100)

  const mortgagePartners = [
    {
      name: 'First Bank',
      rate: '18%',
      maxTerm: '25 years',
      maxAmount: '₦100M',
    },
    {
      name: 'Union Bank',
      rate: '17.5%',
      maxTerm: '20 years',
      maxAmount: '₦80M',
    },
    {
      name: 'Access Bank',
      rate: '18.5%',
      maxTerm: '30 years',
      maxAmount: '₦150M',
    },
    {
      name: 'Sterling Bank',
      rate: '19%',
      maxTerm: '15 years',
      maxAmount: '₦50M',
    },
    {
      name: 'Federal Mortgage Bank',
      rate: '16%',
      maxTerm: '30 years',
      maxAmount: '₦15M',
    },
    {
      name: 'Cooperative Mortgage',
      rate: '15%',
      maxTerm: '25 years',
      maxAmount: '₦25M',
    },
  ]

  const mortgageTypes = [
    {
      type: 'nhf',
      title: 'National Housing Fund',
      description: 'Government-backed mortgage for Nigerian workers',
      interest: '6%',
      features: ['Low interest rate', 'Long tenure', 'Strict eligibility'],
    },
    {
      type: 'commercial',
      title: 'Commercial Bank Mortgage',
      description: 'Standard mortgage from partner banks',
      interest: '17-20%',
      features: ['Wider eligibility', 'Flexible terms', 'Faster processing'],
    },
    {
      type: 'cooperative',
      title: 'Cooperative Mortgage',
      description: 'Group-based financing through cooperatives',
      interest: '14-16%',
      features: ['Lower rates', 'Community support', 'Shared risk'],
    },
    {
      type: 'developer',
      title: 'Developer Financing',
      description: 'Direct financing from property developers',
      interest: '15-25%',
      features: [
        'Simplified process',
        'Direct to developer',
        'Flexible down payment',
      ],
    },
  ]

  const eligibilityCriteria = [
    { requirement: 'Minimum Age', value: '21 years' },
    { requirement: 'Maximum Age at Maturity', value: '65 years' },
    { requirement: 'Minimum Income', value: '₦150,000/month' },
    { requirement: 'Employment Type', value: 'Formal or verifiable business' },
    { requirement: 'Credit History', value: 'Clean record required' },
    { requirement: 'Down Payment', value: '30-50% typically' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-linear-to-r from-emerald-600 to-emerald-700 text-white py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              Mortgage Financing Solutions
            </h1>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto mb-8">
              Access affordable mortgage options through our trusted banking
              partners. Own your dream home with flexible payment plans.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-emerald-700 hover:bg-gray-100 px-8"
              >
                <Link href="#calculator">Calculate Your Mortgage</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/schedule-meeting">Talk to Mortgage Advisor</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mortgage Calculator */}
      <section id="calculator" className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Mortgage Calculator
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Estimate your monthly payments and see what you can afford
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Calculator Inputs */}
            <div className="bg-emerald-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Enter Your Details
              </h3>

              <div className="space-y-8">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Property Price
                    </label>
                    <span className="text-lg font-bold text-emerald-600">
                      ₦{propertyPrice.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[propertyPrice]}
                    onValueChange={(value) => setPropertyPrice(value[0])}
                    min={1000000}
                    max={500000000}
                    step={1000000}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>₦1M</span>
                    <span>₦500M</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Down Payment
                    </label>
                    <span className="text-lg font-bold text-emerald-600">
                      {downPayment}%
                    </span>
                  </div>
                  <Slider
                    value={[downPayment]}
                    onValueChange={(value) => setDownPayment(value[0])}
                    min={10}
                    max={70}
                    step={5}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>10%</span>
                    <span>70%</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Loan Term
                    </label>
                    <span className="text-lg font-bold text-emerald-600">
                      {loanTerm} years
                    </span>
                  </div>
                  <Slider
                    value={[loanTerm]}
                    onValueChange={(value) => setLoanTerm(value[0])}
                    min={5}
                    max={30}
                    step={1}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>5 years</span>
                    <span>30 years</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Income
                  </label>
                  <Select onValueChange={setIncome}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select income range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100-200">
                        ₦100,000 - ₦200,000
                      </SelectItem>
                      <SelectItem value="200-500">
                        ₦200,000 - ₦500,000
                      </SelectItem>
                      <SelectItem value="500-1000">
                        ₦500,000 - ₦1,000,000
                      </SelectItem>
                      <SelectItem value="1000+">₦1,000,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Calculator Results */}
            <div className="bg-linear-to-br from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-6">Your Mortgage Estimate</h3>

              <div className="space-y-6">
                <div className="bg-white/10 p-6 rounded-xl">
                  <div className="text-sm text-emerald-200 mb-1">
                    Monthly Payment
                  </div>
                  <div className="text-4xl font-bold">
                    ₦{monthlyPayment.toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <div className="text-sm text-emerald-200 mb-1">
                      Loan Amount
                    </div>
                    <div className="text-xl font-bold">
                      ₦{Math.round(loanAmount).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <div className="text-sm text-emerald-200 mb-1">
                      Down Payment
                    </div>
                    <div className="text-xl font-bold">
                      ₦{(propertyPrice * (downPayment / 100)).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <div className="text-sm text-emerald-200 mb-1">
                      Total Interest
                    </div>
                    <div className="text-xl font-bold">
                      ₦
                      {(
                        monthlyPayment * loanTerm * 12 -
                        loanAmount
                      ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <div className="text-sm text-emerald-200 mb-1">
                      Total Payment
                    </div>
                    <div className="text-xl font-bold">
                      ₦
                      {(monthlyPayment * loanTerm * 12).toLocaleString(
                        undefined,
                        { maximumFractionDigits: 0 }
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Affordability Check</span>
                  </div>
                  {income && (
                    <div className="text-sm">
                      Based on your income range, this mortgage is{' '}
                      {monthlyPayment >
                      parseInt(income.split('-')[0]) * 1000 * 0.4
                        ? 'potentially difficult'
                        : 'within affordable range'}
                      .
                    </div>
                  )}
                </div>

                <Button
                  asChild
                  className="w-full bg-white text-emerald-700 hover:bg-gray-100 py-6 text-lg font-semibold"
                >
                  <Link href="/application">Apply Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mortgage Types */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Types of Mortgage Plans
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the mortgage option that best fits your situation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mortgageTypes.map((type) => (
              <div
                key={type.type}
                className="bg-white rounded-xl p-6 border shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Percent className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {type.title}
                    </div>
                    <div className="text-emerald-600 font-bold">
                      {type.interest} interest
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{type.description}</p>

                <ul className="space-y-2">
                  {type.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center text-sm text-gray-700"
                    >
                      <CheckCircle className="h-3 w-3 text-emerald-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Mortgage Partners
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We work with reputable financial institutions to get you the best
              rates
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mortgagePartners.map((partner, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-semibold text-gray-900">
                    {partner.name}
                  </div>
                  <div className="text-emerald-600 font-bold">
                    {partner.rate}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Max Term:</span>
                    <span className="font-medium">{partner.maxTerm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Amount:</span>
                    <span className="font-medium">{partner.maxAmount}</span>
                  </div>
                </div>

                <Button asChild variant="outline" className="w-full mt-4">
                  <Link
                    href={`/partners/${partner.name.toLowerCase().replace(' ', '-')}`}
                  >
                    Learn More
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="py-16 bg-emerald-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="bg-white rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Mortgage Eligibility Criteria
              </h2>
              <p className="text-gray-600">
                Basic requirements for mortgage approval with our partners
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eligibilityCriteria.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="shrink-0">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">
                      {item.requirement}
                    </div>
                    <div className="font-semibold text-gray-900">
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/eligibility-check">Check Your Eligibility</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Own Your Dream Home?
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Our mortgage advisors will guide you through the entire process,
              from application to approval and property selection.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6"
              >
                <Link href="/application">
                  <FileText className="mr-2 h-5 w-5" />
                  Start Application
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-6"
              >
                <Link href="/schedule-meeting">
                  <Users className="mr-2 h-5 w-5" />
                  Talk to Advisor
                </Link>
              </Button>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">
                    48hrs
                  </div>
                  <div className="text-sm text-gray-600">
                    Preliminary Approval
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">
                    90%
                  </div>
                  <div className="text-sm text-gray-600">Approval Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">
                    0%
                  </div>
                  <div className="text-sm text-gray-600">Hidden Fees</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

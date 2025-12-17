'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Award,
  Building,
  Eye,
  Globe,
  Handshake,
  Home,
  Mail,
  Quote,
  Shield,
  Target,
  TrendingUp,
  User2,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('mission')

  const teamMembers = [
    {
      name: 'Tunde Oluwaniyi',
      role: 'Founder & CEO',
      experience: '9+ years real estate expertise',
      bio: 'Award-winning Executive Director with deep expertise in real estate, construction, and project management. Founded PropSafe Hub to solve real estate fraud in Nigeria.',
      image: '/tunde_CEO.png',
    },
    {
      name: 'Legal Team',
      role: 'Legal Department',
      experience: 'Property law specialists',
      bio: 'Handles title verification, compliance, and documentation. Ensures every property transaction is legally sound.',
      icon: Shield,
    },
    {
      name: 'Technical Experts',
      role: 'Technical Department',
      experience: 'Surveyors & Engineers',
      bio: 'Geophysical specialists, surveyors, and engineers who conduct physical verification and technical assessments.',
      icon: Building,
    },
    {
      name: 'Customer Experience',
      role: 'Client Relations',
      experience: 'Dedicated support team',
      bio: 'Provides personalized support for clients and investors throughout their real estate journey.',
      icon: Users,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-linear-to-br from-emerald-600 to-emerald-800 text-white py-24">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container relative mx-auto px-4 max-w-7xl">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              Building Trust in Real Estate
            </h1>
            <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
              PropSafe Hub was born from a simple mission: to eliminate real
              estate fraud and make property investment safe, transparent, and
              profitable for every Nigerian.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-emerald-700 hover:bg-gray-100"
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/team">Meet Our Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Founder's Message */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="bg-linear-to-r from-emerald-50 to-white rounded-3xl border-b border-emerald-300 border-t">
            <div className="flex flex-col lg:flex-row gap-12 items-end">
              <div className="lg:w-2/3">
                <div className="pl-10 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Quote className="h-8 w-8 text-emerald-600" />
                    <h2 className="text-2xl font-bold text-gray-900">
                      From The Founder
                    </h2>
                  </div>

                  <blockquote className="text-gray-700 text-lg leading-relaxed mb-6">
                    &quot;I started PropSafe Hub after witnessing too many
                    Nigerians lose their hard-earned money to real estate scams.
                    The pain of families who invested their life savings into
                    properties that turned out to be fake or government-acquired
                    land was heart-wrenching.
                  </blockquote>

                  <p className="text-gray-700 leading-relaxed mb-8">
                    With over 9 years in real estate and construction, I
                    realized the problem wasn&apos;t lack of money or desire to
                    invest—it was lack of <strong>trust</strong> and{' '}
                    <strong>verified information</strong>. PropSafe Hub is our
                    solution: a platform where every property is thoroughly
                    vetted, every document is authenticated, and every investor
                    is protected and can make decisions with confidence.&quot;
                  </p>

                  <div className="border-l-4 border-emerald-600 pl-4">
                    <div className="font-bold text-gray-900">
                      Tunde Oluwaniyi
                    </div>
                    <div className="text-emerald-600">
                      Founder & CEO, PropSafe Hub
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/3">
                <div className="w-88 h-auto mx-auto overflow-hidden">
                  {/* Replace with actual founder image */}
                  <div className="w-full h-full flex items-center justify-center">
                    <Image
                      src="/tunde-oluwaniyi_CEO.png"
                      alt="Tunde Oluwaniyi"
                      width={320}
                      height={320}
                      className=""
                    />
                  </div>
                </div>
                {/* <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      Tunde Oluwaniyi
                    </div>
                    <div className="text-emerald-600 mb-3">Founder & CEO</div>
                  </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Guiding Principles
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The foundation upon which we build trust and deliver excellence
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white rounded-lg p-1">
              {['mission', 'vision', 'values'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-md font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-600 hover:text-emerald-600'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {activeTab === 'mission' && (
              <div className="bg-white rounded-2xl p-8 text-center">
                <div className="inline-flex p-4 bg-emerald-100 text-emerald-600 rounded-xl mb-6">
                  <Target className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Our Mission
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  To create a secured and transparent ecosystem where anyone can
                  confidently invest in real estate without fear of fraud,
                  misinformation, or poor decision-making.
                </p>
              </div>
            )}

            {activeTab === 'vision' && (
              <div className="bg-white rounded-2xl p-8 text-center">
                <div className="inline-flex p-4 bg-emerald-100 text-emerald-600 rounded-xl mb-6">
                  <Eye className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Our Vision
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  To become Africa&apos;s most reliable real estate verification
                  and investment platform— powered by data, technology, and deep
                  industry expertise.
                </p>
              </div>
            )}

            {activeTab === 'values' && (
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    icon: Shield,
                    title: 'Safety',
                    description:
                      'Your peace of mind is our priority. Zero hidden risks.',
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50',
                  },
                  {
                    icon: Handshake,
                    title: 'Integrity',
                    description:
                      'We tell the truth, always. 100% transparent processes.',
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50',
                  },
                  {
                    icon: TrendingUp,
                    title: 'Excellence',
                    description:
                      'Professional standards at every stage of your journey.',
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50',
                  },
                  {
                    icon: Globe,
                    title: 'Value Creation',
                    description:
                      'Every investment must appreciate. We focus on ROI.',
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50',
                  },
                ].map((value, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border">
                    <div
                      className={`inline-flex p-3 ${value.bg} ${value.color} rounded-lg mb-4`}
                    >
                      <value.icon className="h-6 w-6" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {value.title}
                    </h4>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Expert Team
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Behind every verified property is a team of dedicated
              professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full mb-4 overflow-hidden flex items-center justify-center">
                  {member.image ? (
                    <div className="relative w-full h-full">
                      {/* Image would go here */}
                      <div className="w-full h-full bg-emerald-100 flex items-center justify-center">
                        <Image
                          src={member.image}
                          alt={member.name}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-100 rounded-full">
                      <User2 className="h-12 w-12 text-emerald-600" />
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900">
                    {member.name}
                  </h3>
                  <div className="text-emerald-600 font-medium mb-2">
                    {member.role}
                  </div>
                  <div className="text-sm text-gray-500 mb-3">
                    {member.experience}
                  </div>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-linear-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Making a Difference</h2>
            <p className="text-emerald-100 max-w-2xl mx-auto">
              Numbers that tell our story of impact and growth
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">50K+</div>
              <div className="text-emerald-200">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl  font-bold mb-2">15K+</div>
              <div className="text-emerald-200">Properties Verified</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">₦25B+</div>
              <div className="text-emerald-200">Investment Value</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">98%</div>
              <div className="text-emerald-200">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Partner With Us
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Whether you&apos;re buying, selling, or investing, we&apos;re here
              to make your real estate journey safe, transparent, and
              profitable.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6"
              >
                <Link href="/contact">
                  <Mail className="mr-2 h-5 w-5" />
                  Get In Touch
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-6"
              >
                <Link href="/properties">
                  <Home className="mr-2 h-5 w-5" />
                  Browse Properties
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

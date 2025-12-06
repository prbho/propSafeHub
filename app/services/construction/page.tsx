'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, CheckCircle, HardHat, Ruler, Wrench } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function ConstructionDevelopmentPage() {
  const [projectType, setProjectType] = useState('')

  const services = [
    {
      category: 'Design & Planning',
      icon: Ruler,
      items: [
        'Architectural Design',
        'Structural Engineering',
        'MEP (Mechanical, Electrical, Plumbing) Design',
        'Interior Design',
        'Landscape Design',
        '3D Visualization',
      ],
    },
    {
      category: 'Construction',
      icon: HardHat,
      items: [
        'Turnkey Construction',
        'Renovation & Remodeling',
        'Extension Projects',
        'Foundation Work',
        'Structural Works',
        'Finishing Works',
      ],
    },
    {
      category: 'Project Management',
      icon: Calendar,
      items: [
        'Project Planning & Scheduling',
        'Cost Estimation & Budgeting',
        'Quality Control',
        'Timeline Management',
        'Contractor Management',
        'Progress Reporting',
      ],
    },
    {
      category: 'Specialized Services',
      icon: Wrench,
      items: [
        'Swimming Pool Construction',
        'Fencing & Security Systems',
        'Solar Installation',
        'Water Treatment Systems',
        'Smart Home Integration',
        'Eco-Friendly Features',
      ],
    },
  ]

  const projectTypes = [
    {
      type: 'residential',
      title: 'Residential Building',
      description: 'Single-family homes, duplexes, apartments',
      timeline: '6-18 months',
      startingPrice: '₦15M',
    },
    {
      type: 'commercial',
      title: 'Commercial Building',
      description: 'Office spaces, retail outlets, mixed-use',
      timeline: '12-24 months',
      startingPrice: '₦50M',
    },
    {
      type: 'renovation',
      title: 'Renovation Project',
      description: 'Home upgrades, office remodeling',
      timeline: '1-6 months',
      startingPrice: '₦5M',
    },
    {
      type: 'estate',
      title: 'Estate Development',
      description: 'Gated communities, housing estates',
      timeline: '24+ months',
      startingPrice: '₦200M',
    },
  ]

  const constructionStages = [
    {
      stage: 1,
      title: 'Consultation & Feasibility',
      description: 'Site assessment and project viability study',
      duration: '1-2 weeks',
    },
    {
      stage: 2,
      title: 'Design & Planning',
      description: 'Architectural designs and approval processing',
      duration: '4-8 weeks',
    },
    {
      stage: 3,
      title: 'Pre-Construction',
      description: 'Permits, material sourcing, contractor selection',
      duration: '2-4 weeks',
    },
    {
      stage: 4,
      title: 'Construction',
      description: 'Foundation to finishing work',
      duration: 'Varies by project',
    },
    {
      stage: 5,
      title: 'Handover',
      description: 'Final inspection, documentation, keys handover',
      duration: '2-4 weeks',
    },
    {
      stage: 6,
      title: 'Post-Construction',
      description: 'Warranty period and maintenance support',
      duration: '12 months',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-linear-to-r from-emerald-600 to-emerald-700 text-white py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              Construction & Development Services
            </h1>
            <p className="text-xl text-orange-100 max-w-3xl mx-auto mb-8">
              Turn your property vision into reality with our end-to-end
              construction and project management expertise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-emerald-700 hover:bg-gray-100 px-8"
              >
                <Link href="#get-quote">Get Free Quote</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/portfolio">View Our Projects</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">200+</div>
              <div className="text-emerald-200">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">15</div>
              <div className="text-emerald-200">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">98%</div>
              <div className="text-emerald-200">On-Time Delivery</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">50+</div>
              <div className="text-emerald-200">Professional Team</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Construction Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From concept to completion, we handle every aspect of your
              construction project.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((category, idx) => (
              <div key={idx} className="bg-emerald-50 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-emerald-600 text-emerald-50 rounded-lg">
                    <category.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {category.category}
                  </h3>
                </div>

                <ul className="space-y-3">
                  {category.items.map((item, itemIdx) => (
                    <li
                      key={itemIdx}
                      className="flex items-center text-gray-700"
                    >
                      <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Types */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Types of Projects We Handle
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {projectTypes.map((project) => (
              <button
                key={project.type}
                onClick={() => setProjectType(project.type)}
                className={`p-6 rounded-xl text-left transition-all ${
                  projectType === project.type
                    ? 'border-2 border-emerald-600 bg-emerald-50'
                    : 'border border-gray-200 hover:border-emerald-300 bg-white'
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {project.description}
                </p>
                <div className="flex justify-between text-sm">
                  <div className="text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {project.timeline}
                    </div>
                  </div>
                  <div className="text-emerald-600 font-semibold">
                    From {project.startingPrice}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Construction Process
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A systematic approach to ensure quality, timeline, and budget
              adherence
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-emerald-200"></div>

            <div className="space-y-12">
              {constructionStages.map((stage, idx) => (
                <div
                  key={stage.stage}
                  className={`relative flex flex-col md:flex-row items-center ${
                    idx % 2 === 0 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Stage content */}
                  <div
                    className={`md:w-1/2 ${idx % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}
                  >
                    <div className="bg-white p-8 rounded-2xl border shadow-lg">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl">
                          <span className="text-xl font-bold">
                            {stage.stage}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {stage.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {stage.duration}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700">{stage.description}</p>
                    </div>
                  </div>

                  {/* Timeline dot */}
                  <div className="absolute left-1/18 transform -translate-x-1/18 md:relative md:left-auto md:transform-none">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full border-4 border-emerald-300"></div>
                  </div>

                  {/* Empty space for alternating sides */}
                  <div className="md:w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

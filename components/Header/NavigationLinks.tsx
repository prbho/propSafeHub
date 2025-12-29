// components/Header/NavigationLinks.tsx
'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import {
  BadgeQuestionMark,
  Building,
  Calculator,
  ChevronDown,
  FileCheck,
  Globe,
  Handshake,
  Plane,
  TrendingUp,
  Users,
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function NavigationLinks() {
  return (
    <nav className="flex items-center space-x-6">
      {/* Properties - Updated with PropSafe Hub property types */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center text-sm text-gray-700 hover:text-emerald-600 transition-colors">
          Properties
          <ChevronDown className="h-3 w-3 ml-1" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48">
          <DropdownMenuItem asChild>
            <Link
              href="/properties?type=buy"
              className="flex items-center cursor-pointer"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2" />
              For Sale
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/properties?type=rent"
              className="flex items-center cursor-pointer"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2" />
              For Rent
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/properties?type=short-let"
              className="flex items-center cursor-pointer"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2" />
              For Short-let
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/list-property"
              className="flex items-center cursor-pointer"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2" />
              List Your Property
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Services - This is CRITICAL for PropSafe Hub */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center text-sm text-gray-700 hover:text-emerald-600 transition-colors">
          Services
          <ChevronDown className="h-3 w-3 ml-1" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-56">
          <DropdownMenuItem asChild>
            <Link
              href="/services/verification"
              className="flex items-center cursor-pointer"
            >
              <FileCheck className="h-4 w-4 mr-2 text-emerald-600" />
              <div>
                <p className="font-medium">Property Verification</p>
                <p className="text-xs text-gray-500">
                  Title checks & due diligence
                </p>
              </div>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/services/advisory"
              className="flex items-center cursor-pointer"
            >
              <TrendingUp className="h-4 w-4 mr-2 text-emerald-600" />
              <div>
                <p className="font-medium">Investment Advisory</p>
                <p className="text-xs text-gray-500">
                  Personalized strategy & planning
                </p>
              </div>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/services/diaspora"
              className="flex items-center cursor-pointer"
            >
              <Globe className="h-4 w-4 mr-2 text-emerald-600" />
              <div>
                <p className="font-medium">Diaspora Support</p>
                <p className="text-xs text-gray-500">
                  Buy from abroad securely
                </p>
              </div>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/services/construction"
              className="flex items-center cursor-pointer"
            >
              <Building className="h-4 w-4 mr-2 text-emerald-600" />
              <div>
                <p className="font-medium">Construction Management</p>
                <p className="text-xs text-gray-500">
                  Turnkey building projects
                </p>
              </div>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/services/mortgage"
              className="flex items-center cursor-pointer"
            >
              <div className="h-4 w-4 mr-2 flex items-center justify-center text-emerald-600 font-bold">
                ₦
              </div>
              <div>
                <p className="font-medium">Mortgage Access</p>
                <p className="text-xs text-gray-500">
                  Financing through partners
                </p>
              </div>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* AGENTS - NEW SECTION */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center text-sm text-gray-700 hover:text-emerald-600 transition-colors">
          Agents
          <ChevronDown className="h-3 w-3 ml-1" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48">
          <DropdownMenuItem asChild>
            <Link href="/agents" className="flex items-center cursor-pointer">
              <Users className="h-4 w-4 mr-2 text-emerald-600" />
              <div>
                <p className="font-medium">Browse All Agents</p>
                <p className="text-xs text-gray-500">View all listing agents</p>
              </div>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/list-property"
              className="flex items-center cursor-pointer text-emerald-600 font-medium"
            >
              <Handshake className="h-4 w-4 mr-2" />
              Become an Agent
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Resources */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center text-sm text-gray-700 hover:text-emerald-600 transition-colors">
          Resources
          <ChevronDown className="h-3 w-3 ml-1" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48">
          <DropdownMenuItem asChild>
            <Link href="/mortgage-calculator" className="cursor-pointer">
              <Calculator className="h-4 w-4 mr-1 text-emerald-600" />
              Mortgage Calculator
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/faqs" className="cursor-pointer">
              <BadgeQuestionMark className="h-4 w-4 mr-1 text-emerald-600" />
              Frequently Asked Questions
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/services/diaspora" className="cursor-pointer">
              <Plane className="h-4 w-4 mr-1 text-emerald-600" />
              Diaspora Investor Guide
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* About Us - Important for establishing trust */}
      <Link
        href="/about"
        className="text-sm text-gray-700 hover:text-emerald-600 transition-colors"
      >
        Company
      </Link>

      {/* Contact - Important for consultations */}
      <Link
        href="/contact"
        className="text-sm text-gray-700 hover:text-emerald-600 transition-colors"
      >
        Contact
      </Link>
    </nav>
  )
}

// components/AgentLeads.tsx - Update the MessageButton usage
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Lead } from '@/types'
import { Query } from 'appwrite'
import {
  Bed,
  Calendar,
  Clock,
  DollarSign,
  Filter,
  Home,
  Mail,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  User,
} from 'lucide-react'

import { databases } from '@/lib/appwrite'

import MessageButton from '../messages/MessageButton'

export default function AgentLeads() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [timelineFilter, setTimelineFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')

  const fetchLeads = useCallback(async () => {
    if (!user?.$id) return

    try {
      setLoading(true)
      const databaseId =
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'propertyDB'
      const leadsCollectionId = 'leads'

      const response = await databases.listDocuments(
        databaseId,
        leadsCollectionId,
        [
          Query.equal('assignedAgentId', user.$id),
          Query.orderDesc('$createdAt'),
          Query.limit(100),
        ]
      )

      console.log('Fetched leads:', response.documents.length)
      setLeads(response.documents as unknown as Lead[])
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.$id])

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.userType !== 'agent') {
        router.push('/dashboard')
        return
      }
      fetchLeads()
    }
  }, [isAuthenticated, user, router, fetchLeads])

  // Filter and sort leads
  const filteredLeads = leads
    .filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.propertyInterest
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        lead.location.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' || lead.status === statusFilter
      const matchesTimeline =
        timelineFilter === 'all' || lead.timeline === timelineFilter

      return matchesSearch && matchesStatus && matchesTimeline
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
          )
        case 'oldest':
          return (
            new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime()
          )
        case 'budget_high':
          return b.budget - a.budget
        case 'budget_low':
          return a.budget - b.budget
        case 'timeline_urgent':
          // Custom sorting for timeline urgency
          const timelinePriority: { [key: string]: number } = {
            immediately: 1,
            within_1_week: 2,
            '1-3_months': 3,
            '3-6_months': 4,
            '6+_months': 5,
            flexible: 6,
          }
          return timelinePriority[a.timeline] - timelinePriority[b.timeline]
        default:
          return 0
      }
    })

  // Stats calculations
  const totalLeads = leads.length
  const newLeads = leads.filter((lead) => lead.status === 'new').length
  const contactedLeads = leads.filter(
    (lead) => lead.status === 'contacted'
  ).length
  const qualifiedLeads = leads.filter(
    (lead) => lead.status === 'qualified'
  ).length

  // Update lead status
  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'propertyDB',
        'leads',
        leadId,
        { status: newStatus }
      )

      // Update local state
      setLeads(
        leads.map((lead) =>
          lead.$id === leadId ? { ...lead, status: newStatus } : lead
        )
      )
    } catch (error) {
      console.error('Error updating lead status:', error)
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      viewing_scheduled: 'bg-purple-100 text-purple-800',
      offer_made: 'bg-indigo-100 text-indigo-800',
      closed_won: 'bg-green-100 text-green-800',
      closed_lost: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  // Get timeline color and icon
  const getTimelineInfo = (timeline: string) => {
    const info: { [key: string]: { color: string; text: string } } = {
      immediately: { color: 'text-red-600', text: 'Immediately' },
      within_1_week: { color: 'text-orange-600', text: 'Within 1 Week' },
      '1-3_months': { color: 'text-yellow-600', text: '1-3 Months' },
      '3-6_months': { color: 'text-blue-600', text: '3-6 Months' },
      '6+_months': { color: 'text-green-600', text: '6+ Months' },
      flexible: { color: 'text-gray-600', text: 'Flexible' },
    }
    return info[timeline] || { color: 'text-gray-600', text: timeline }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto px-6 max-w-7xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-gray-200 p-6"
                >
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-gray-200 p-6"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Leads Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and track your property leads and inquiries
            </p>
          </div>
          <Link
            href="/agent/leads/add"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Lead
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
              </div>
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Leads</p>
                <p className="text-2xl font-bold text-gray-900">{newLeads}</p>
                <p className="text-sm text-green-600">Need contact</p>
              </div>
              <Mail className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contactedLeads}
                </p>
                <p className="text-sm text-yellow-600">Follow up needed</p>
              </div>
              <MessageCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Qualified</p>
                <p className="text-2xl font-bold text-gray-900">
                  {qualifiedLeads}
                </p>
                <p className="text-sm text-blue-600">Hot leads</p>
              </div>
              <Home className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search leads by name, email, property, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="viewing_scheduled">Viewing Scheduled</option>
                <option value="offer_made">Offer Made</option>
                <option value="closed_won">Closed Won</option>
                <option value="closed_lost">Closed Lost</option>
              </select>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="budget_high">Budget: High to Low</option>
                <option value="budget_low">Budget: Low to High</option>
                <option value="timeline_urgent">Timeline: Urgent First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leads List */}
        {filteredLeads.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {leads.length === 0 ? 'No Leads Yet' : 'No Leads Found'}
            </h3>
            <p className="text-gray-500 mb-6">
              {leads.length === 0
                ? 'Start by adding your first lead or wait for inquiries to come in.'
                : 'Try adjusting your search criteria or filters to find more leads.'}
            </p>
            <div className="flex gap-4 justify-center">
              {leads.length === 0 && (
                <Link
                  href="/agent/leads/add"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Lead
                </Link>
              )}
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setTimelineFilter('all')
                  setSortBy('newest')
                }}
                className="inline-flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLeads.map((lead) => (
              <div
                key={lead.$id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Lead Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          {lead.name}
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getStatusColor(lead.status)}`}
                          >
                            {lead.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {lead.email}
                          </span>
                          {lead.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {lead.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateLeadStatus(lead.$id, 'contacted')
                          }
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Mark as Contacted"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            updateLeadStatus(lead.$id, 'qualified')
                          }
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Mark as Qualified"
                        >
                          <User className="w-4 h-4" />
                        </button>

                        {/* Message Button - Fixed with proper props */}
                        <MessageButton
                          agentId={lead.$id}
                          agentName={lead.name}
                          propertyId={(lead as any).propertyId}
                          propertyTitle={lead.propertyInterest}
                          variant="icon"
                          className="p-0"
                        />

                        <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">Interested in:</span>
                        <span className="text-gray-600">
                          {lead.propertyInterest || 'Not specified'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="font-medium">Location:</span>
                        <span className="text-gray-600">
                          {lead.location || 'Not specified'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="font-medium">Budget:</span>
                        <span className="text-gray-600">
                          ₦{lead.budget?.toLocaleString() || 'Not specified'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="font-medium">Bedrooms:</span>
                        <span className="text-gray-600">
                          {lead.bedrooms || 'Any'}
                        </span>
                      </div>
                    </div>

                    {/* Timeline and Source */}
                    <div className="flex items-center gap-6 mt-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span className={getTimelineInfo(lead.timeline).color}>
                          {getTimelineInfo(lead.timeline).text}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Source:</span>
                        <span>{lead.source || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(lead.$createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Message Preview */}
                    {lead.message && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          &quot;{lead.message}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Update Buttons */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                  {[
                    'new',
                    'contacted',
                    'qualified',
                    'viewing_scheduled',
                    'offer_made',
                    'closed_won',
                    'closed_lost',
                  ].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateLeadStatus(lead.$id, status)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        lead.status === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

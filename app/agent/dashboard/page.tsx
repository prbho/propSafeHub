'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  Calendar,
  Eye,
  Home,
  MessageSquare,
  Star,
  TrendingUp,
} from 'lucide-react'

import RecentViewings from '@/components/agents/RecentViewings'
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton'
import DashboardStats from '@/components/dashboard/DashboardStats'

interface AgentStats {
  totalListings: number
  totalViews: number
  totalFavorites: number
  pendingViewings: number
  confirmedViewings: number
  recentViewings: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function AgentDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [agentStats, setAgentStats] = useState<AgentStats>({
    totalListings: 0,
    totalViews: 0,
    totalFavorites: 0,
    pendingViewings: 0,
    confirmedViewings: 0,
    recentViewings: [],
  })
  const [dashboardLoading, setDashboardLoading] = useState(true)

  const fetchAgentStats = useCallback(async () => {
    if (!user?.$id) return

    try {
      setDashboardLoading(true)
      const response = await fetch(`/api/agents/${user.$id}/dashboard-stats`)

      if (response.ok) {
        const data = await response.json()
        setAgentStats(data)
      }
    } catch (error) {
      console.error('Error fetching agent stats:', error)
    } finally {
      setDashboardLoading(false)
    }
  }, [user?.$id])

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.userType !== 'agent') {
        router.push('/dashboard')
        return
      }
      fetchAgentStats()
    }
  }, [isAuthenticated, user, router, fetchAgentStats])

  const stats = [
    {
      title: 'Total Listings',
      value: agentStats.totalListings,
      icon: Home,
      description: 'Active properties',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Property Views',
      value: agentStats.totalViews,
      icon: Eye,
      description: 'Total views this month',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Favorites',
      value: agentStats.totalFavorites,
      icon: Star,
      description: 'User favorites',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Pending Viewings',
      value: agentStats.pendingViewings,
      icon: Calendar,
      description: 'Awaiting confirmation',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
  ]

  const quickActions = [
    {
      title: 'Add New Property',
      description: 'List a new property',
      icon: Home,
      href: '/agent/properties/new',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Manage Viewings',
      description: 'Schedule and confirm tours',
      icon: Calendar,
      href: '/agent/viewings',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Messages',
      description: 'Respond to inquiries',
      icon: MessageSquare,
      href: '/agent/messages',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'Performance',
      description: 'View analytics',
      icon: TrendingUp,
      href: '/agent/analytics',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ]

  if (isLoading || dashboardLoading) {
    return <DashboardSkeleton />
  }

  if (!isAuthenticated || user?.userType !== 'agent') {
    return null // Router will handle redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-6 max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Agent Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {user.name}! Manage your properties and clients.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Stats Grid */}
        <DashboardStats stats={stats} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <a
                    key={index}
                    href={action.href}
                    className={`flex items-center p-4 rounded-lg text-white ${action.color} transition-colors hover:shadow-md`}
                  >
                    <action.icon className="w-6 h-6 mr-3" />
                    <div>
                      <p className="font-semibold">{action.title}</p>
                      <p className="text-sm opacity-90">{action.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Additional content can go here */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Performance Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {agentStats.confirmedViewings}
                  </p>
                  <p className="text-sm text-blue-800">Confirmed Viewings</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {agentStats.totalFavorites}
                  </p>
                  <p className="text-sm text-green-800">Property Favorites</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {agentStats.totalViews}
                  </p>
                  <p className="text-sm text-purple-800">Total Views</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Recent Viewing Requests */}
            <RecentViewings limit={5} />

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                This Month
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Confirmed Viewings
                  </span>
                  <span className="font-semibold text-green-600">
                    {agentStats.confirmedViewings}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Pending Viewings
                  </span>
                  <span className="font-semibold text-orange-600">
                    {agentStats.pendingViewings}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Listings</span>
                  <span className="font-semibold text-blue-600">
                    {agentStats.totalListings}
                  </span>
                </div>
              </div>
            </div>

            {/* Market Tips */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Professional Tips
              </h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="font-medium text-yellow-800">Quick Response</p>
                  <p className="text-yellow-700 mt-1">
                    Respond to viewing requests within 2 hours to increase
                    conversion by 40%.
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800">Quality Photos</p>
                  <p className="text-blue-700 mt-1">
                    Properties with professional photos get 3x more views.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

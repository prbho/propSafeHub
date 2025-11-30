// app/admin/dashboard/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Query } from 'appwrite'
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Home,
  Settings,
  Shield,
  UserCheck,
  Users,
} from 'lucide-react'

import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton'
import { databases } from '@/lib/appwrite'

interface AdminStats {
  totalUsers: number
  totalAgents: number
  verifiedAgents: number
  totalProperties: number
  pendingApprovals: number
  totalViews: number
  totalFavorites: number
  activeListings: number
  recentActivities: any[]
  topPerformingAgents: any[]
}

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 0,
    totalAgents: 0,
    verifiedAgents: 0,
    totalProperties: 0,
    pendingApprovals: 0,
    totalViews: 0,
    totalFavorites: 0,
    activeListings: 0,
    recentActivities: [],
    topPerformingAgents: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.userType !== 'admin') {
        router.push('/dashboard')
        return
      }
      fetchAdminStats()
    }
  }, [isAuthenticated, user, router])

  const fetchAdminStats = async () => {
    try {
      setLoading(true)
      const databaseId =
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'propertyDB'

      // Fetch all data in parallel
      const [
        usersResponse,
        allAgentsResponse,
        verifiedAgentsResponse,
        propertiesResponse,
        pendingApprovalsResponse,
        activeListingsResponse,
      ] = await Promise.all([
        // Total Users (from users collection)
        databases.listDocuments(
          databaseId,
          'users', // Your users collection
          [Query.limit(1)] // Just to get total count
        ),

        // Total Agents (from agents collection)
        databases.listDocuments(
          databaseId,
          'agents', // Your agents collection
          [Query.limit(1)]
        ),

        // Verified Agents only (from agents collection with isVerified: true)
        databases.listDocuments(
          databaseId,
          'agents', // Your agents collection
          [Query.equal('isVerified', true), Query.limit(1)]
        ),

        // Total Properties
        databases.listDocuments(
          databaseId,
          'properties', // Your properties collection
          [Query.limit(1)]
        ),

        // Pending Approvals (properties that are not verified)
        databases.listDocuments(databaseId, 'properties', [
          Query.equal('isVerified', false),
          Query.equal('isActive', true),
          Query.limit(1),
        ]),

        // Active Listings
        databases.listDocuments(databaseId, 'properties', [
          Query.equal('isActive', true),
          Query.equal('isVerified', true),
          Query.limit(1),
        ]),
      ])

      // Calculate totals from views and favorites
      const allProperties = await databases.listDocuments(
        databaseId,
        'properties',
        [Query.limit(1000)] // Adjust based on your needs
      )

      const totalViews = allProperties.documents.reduce(
        (sum, property) => sum + (property.views || 0),
        0
      )

      const totalFavorites = allProperties.documents.reduce(
        (sum, property) => sum + (property.favorites || 0),
        0
      )

      // Get recent activities (last 5 property creations)
      const recentActivities = await databases.listDocuments(
        databaseId,
        'properties',
        [
          Query.orderDesc('$createdAt'),
          Query.limit(5),
          Query.select(['$createdAt', 'title', 'agentName', 'isVerified']),
        ]
      )

      // Get verified agents list for filtering
      const verifiedAgentsList = await databases.listDocuments(
        databaseId,
        'agents',
        [Query.equal('isVerified', true)]
      )

      const verifiedAgentIds = new Set(
        verifiedAgentsList.documents.map((agent) => agent.$id)
      )

      // Get top performing agents (only verified agents with most properties)
      const agentsWithProperties = await databases.listDocuments(
        databaseId,
        'properties',
        [
          Query.select(['agentId', 'agentName', 'views', 'favorites']),
          Query.limit(1000),
        ]
      )

      // Calculate agent performance (only for verified agents)
      const agentPerformance = agentsWithProperties.documents.reduce(
        (acc, property) => {
          if (!property.agentId || !verifiedAgentIds.has(property.agentId))
            return acc

          if (!acc[property.agentId]) {
            acc[property.agentId] = {
              name: property.agentName || 'Unknown Agent',
              listings: 0,
              views: 0,
              favorites: 0,
            }
          }

          acc[property.agentId].listings++
          acc[property.agentId].views += property.views || 0
          acc[property.agentId].favorites += property.favorites || 0

          return acc
        },
        {} as any
      )

      const topPerformingAgents = Object.values(agentPerformance)
        .sort((a: any, b: any) => b.listings - a.listings)
        .slice(0, 3)

      // Transform recent activities for display
      const transformedActivities = recentActivities.documents.map((doc) => ({
        id: doc.$id,
        type: 'property_submission',
        user: doc.agentName || 'Unknown Agent',
        action: `submitted "${doc.title}"`,
        time: new Date(doc.$createdAt).toLocaleDateString(),
        status: doc.isVerified ? 'approved' : 'pending',
      }))

      setAdminStats({
        totalUsers: usersResponse.total,
        totalAgents: allAgentsResponse.total, // All agents from agents collection
        verifiedAgents: verifiedAgentsResponse.total, // Only verified agents from agents collection
        totalProperties: propertiesResponse.total,
        pendingApprovals: pendingApprovalsResponse.total,
        totalViews,
        totalFavorites,
        activeListings: activeListingsResponse.total,
        recentActivities: transformedActivities,
        topPerformingAgents,
      })
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      title: 'Total Users',
      value: adminStats.totalUsers.toLocaleString(),
      icon: Users,
      description: 'Registered platform users',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Registered Agents',
      value: adminStats.verifiedAgents.toLocaleString(), // Only verified agents
      icon: UserCheck,
      description: 'Verified professionals',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Agents',
      value: adminStats.totalAgents.toLocaleString(), // All agents (including unverified)
      icon: Users,
      description: 'All agent accounts',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
    },
    {
      title: 'Total Properties',
      value: adminStats.totalProperties.toLocaleString(),
      icon: Home,
      description: 'All property listings',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Pending Approvals',
      value: adminStats.pendingApprovals.toString(),
      icon: AlertTriangle,
      description: 'Properties awaiting review',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      urgent: true,
    },
    {
      title: 'Active Listings',
      value: adminStats.activeListings.toLocaleString(),
      icon: CheckCircle,
      description: 'Verified live properties',
      color: 'text-teal-500',
      bgColor: 'bg-teal-50',
    },
  ]

  const quickActions = [
    {
      title: 'Approval Queue',
      description: 'Review pending submissions',
      icon: Shield,
      href: '/admin/approvals',
      color: 'bg-orange-500 hover:bg-orange-600',
      badge: adminStats.pendingApprovals,
    },
    {
      title: 'Agent Management',
      description: 'Verify and manage agents',
      icon: UserCheck,
      href: '/admin/agents',
      color: 'bg-green-500 hover:bg-green-600',
      badge: adminStats.totalAgents - adminStats.verifiedAgents, // Pending agent verifications
    },
    {
      title: 'User Management',
      description: 'Manage all users',
      icon: Users,
      href: '/admin/users',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Properties',
      description: 'Manage all listings',
      icon: Home,
      href: '/admin/properties',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'Analytics',
      description: 'Platform performance',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
    {
      title: 'System Settings',
      description: 'Platform configuration',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-gray-600 hover:bg-gray-700',
    },
  ]

  const systemHealth = [
    {
      metric: 'Database',
      value: 'Connected',
      status: 'healthy',
      description: 'Appwrite database',
    },
    {
      metric: 'Verified Agents',
      value: `${adminStats.verifiedAgents} active`,
      status: adminStats.verifiedAgents > 0 ? 'healthy' : 'warning',
      description: 'Professional agents',
    },
    {
      metric: 'Platform Activity',
      value: adminStats.totalProperties > 0 ? 'Active' : 'No Data',
      status: adminStats.totalProperties > 0 ? 'healthy' : 'warning',
      description: `${adminStats.totalProperties} properties`,
    },
    {
      metric: 'Pending Actions',
      value: `${adminStats.pendingApprovals} items`,
      status: adminStats.pendingApprovals > 0 ? 'warning' : 'healthy',
      description: 'Awaiting review',
    },
  ]

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (!isAuthenticated || user?.userType !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                System overview and platform management
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">System Administrator</p>
              </div>
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              {stat.urgent && adminStats.pendingApprovals > 0 && (
                <div className="mt-3 flex items-center text-sm text-orange-600">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Requires attention
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>
                <span className="text-sm text-gray-500">System Management</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className={`flex flex-col p-4 rounded-lg text-white ${action.color} transition-all hover:shadow-md hover:scale-105`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <action.icon className="w-5 h-5" />
                      {action.badge !== undefined && action.badge > 0 && (
                        <span className="bg-white text-orange-600 text-xs rounded-full px-2 py-1 min-w-6 h-6 flex items-center justify-center">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-sm">{action.title}</p>
                    <p className="text-xs opacity-90 mt-1">
                      {action.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* System Health & Performance */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                System Health
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {systemHealth.map((health, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {health.metric}
                      </p>
                      <p className="text-sm text-gray-500">
                        {health.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          health.status === 'healthy'
                            ? 'text-green-600'
                            : health.status === 'warning'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}
                      >
                        {health.value}
                      </span>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          health.status === 'healthy'
                            ? 'bg-green-500'
                            : health.status === 'warning'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Agents (Verified Only) */}
            {adminStats.topPerformingAgents.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Top Performing Agents
                  </h3>
                  <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Verified Professionals
                  </span>
                </div>
                <div className="space-y-4">
                  {adminStats.topPerformingAgents.map(
                    (agent: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {agent.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {agent.listings} verified listings
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {agent.views} views
                          </p>
                          <p className="text-sm text-green-600">
                            {agent.favorites} favorites
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </h3>
                <span className="text-sm text-gray-500">
                  Last 5 submissions
                </span>
              </div>
              <div className="space-y-4">
                {adminStats.recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                        activity.status === 'approved'
                          ? 'bg-green-100'
                          : 'bg-orange-100'
                      }`}
                    >
                      {activity.status === 'approved' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.user}
                      </p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
                {adminStats.recentActivities.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>
            </div>

            {/* Agent Verification Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Agent Verification Status
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Verified Agents
                    </span>
                  </div>
                  <span className="font-semibold text-green-600">
                    {adminStats.verifiedAgents}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Pending Verification
                    </span>
                  </div>
                  <span className="font-semibold text-orange-600">
                    {adminStats.totalAgents - adminStats.verifiedAgents}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Total Agent Accounts
                    </span>
                  </div>
                  <span className="font-semibold text-blue-600">
                    {adminStats.totalAgents}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

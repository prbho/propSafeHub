/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AnalyticsData, Property, ScheduleViewing } from '@/types'
import { Query } from 'appwrite'
import {
  AlertCircle,
  BarChart3,
  Calendar,
  Eye,
  Filter,
  Home,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { databases } from '@/lib/appwrite'

// Define types for our processed data
interface TimelineDataPoint {
  date: string
  viewings: number
  leads: number
}

interface PropertyPerformanceItem {
  propertyId: string
  title: string
  views: number
  favorites: number
  leads: number
  conversionRate: number
  status: 'for-sale' | 'for-rent' | 'sold' | 'rented'
  price: number
}

interface LeadSourceItem {
  source: string
  count: number
  percentage: number
  trend: 'up' | 'down' | 'neutral'
}

// Extended Property type for analytics
interface AnalyticsProperty extends Property {
  leads?: number
  conversionRate?: number
}

export default function AnalyticsPage() {
  const { user, isAuthenticated } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalyticsData = useCallback(async () => {
    if (!user?.$id) return

    try {
      setLoading(true)
      setError(null)

      // Use your actual collection IDs from environment variables
      const propertiesCollectionId =
        process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID || 'properties'
      const viewingsCollectionId =
        process.env.NEXT_PUBLIC_SCHEDULE_VIEWING_COLLECTION_ID ||
        'scheduleViewings'
      const messagesCollectionId =
        process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_TABLE_ID || 'messages'
      const databaseId =
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'propertyDB'

      // Fetch properties for this agent
      const properties = await databases.listDocuments(
        databaseId,
        propertiesCollectionId,
        [Query.equal('agentId', user.$id), Query.limit(100)]
      )

      // Fetch viewings for this agent's properties
      const viewings = await databases.listDocuments(
        databaseId,
        viewingsCollectionId,
        [Query.equal('agentId', user.$id), Query.limit(100)]
      )

      // Fetch messages for lead tracking
      const messages = await databases.listDocuments(
        databaseId,
        messagesCollectionId,
        [Query.equal('toUserId', user.$id), Query.limit(100)]
      )

      // Process the data
      const processedData = processAnalyticsData(
        properties.documents,
        viewings.documents,
        messages.documents,
        timeRange
      )

      setAnalyticsData(processedData)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to fetch analytics data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.$id, timeRange])

  useEffect(() => {
    if (isAuthenticated && user && user.$id) {
      fetchAnalyticsData()
    }
  }, [isAuthenticated, user, timeRange, fetchAnalyticsData])

  const processAnalyticsData = (
    properties: any[],
    viewings: any[],
    messages: any[],
    range: '7d' | '30d' | '90d'
  ): AnalyticsData => {
    // Calculate overview metrics
    const totalViews = properties.reduce(
      (sum: number, prop: any) => sum + (prop.views || 0),
      0
    )

    const totalLeads = messages.length
    const activeListings = properties.filter((p: any) => p.isActive).length
    const pendingViewings = viewings.filter(
      (v: any) => v.status === 'pending'
    ).length
    const confirmedViewings = viewings.filter(
      (v: any) => v.status === 'confirmed'
    ).length

    // Calculate conversion rate (leads to confirmed viewings)
    const conversionRate =
      totalLeads > 0 ? (confirmedViewings / totalLeads) * 100 : 0

    // Generate timeline data based on time range
    const timelineData = generateTimelineData(viewings, messages, range)

    // Calculate property performance with more metrics
    const propertyPerformance: PropertyPerformanceItem[] = properties.map(
      (property: any) => {
        const propertyLeads = messages.filter(
          (m: any) => m.propertyId === property.$id
        ).length
        const propertyViewings = viewings.filter(
          (v: any) => v.propertyId === property.$id
        ).length
        const propertyConversionRate =
          property.views > 0 ? (propertyLeads / property.views) * 100 : 0

        return {
          propertyId: property.$id || '',
          title: property.title || 'Untitled Property',
          views: property.views || 0,
          favorites: property.favorites || 0,
          leads: propertyLeads,
          conversionRate: propertyConversionRate,
          status: property.status || 'for-sale',
          price: property.price || 0,
        }
      }
    )

    // Calculate lead sources with real data
    const leadSourceCounts = messages.reduce(
      (acc: Record<string, number>, message: any) => {
        const source = message.source || 'Direct Contact'
        acc[source] = (acc[source] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const totalSources = Math.max(totalLeads, 1)
    const leadSources: LeadSourceItem[] = Object.entries(leadSourceCounts)
      .map(([source, count]) => ({
        source,
        count: count as number,
        percentage: Math.round((count / totalSources) * 100),
        trend: 'up' as const,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)

    // If no real data, use sample data
    if (leadSources.length === 0 && totalLeads > 0) {
      leadSources.push(
        {
          source: 'Property Website',
          count: Math.floor(totalLeads * 0.6),
          percentage: Math.round(((totalLeads * 0.6) / totalSources) * 100),
          trend: 'up',
        },
        {
          source: 'Direct Contact',
          count: Math.floor(totalLeads * 0.2),
          percentage: Math.round(((totalLeads * 0.2) / totalSources) * 100),
          trend: 'up',
        },
        {
          source: 'Referrals',
          count: Math.floor(totalLeads * 0.1),
          percentage: Math.round(((totalLeads * 0.1) / totalSources) * 100),
          trend: 'neutral',
        },
        {
          source: 'Social Media',
          count: Math.floor(totalLeads * 0.1),
          percentage: Math.round(((totalLeads * 0.1) / totalSources) * 100),
          trend: 'up',
        }
      )
    }

    // Calculate performance trends
    const performanceTrends = generatePerformanceTrends(
      properties,
      viewings,
      range
    )

    // Get recent viewings (last 5)
    const recentViewings: ScheduleViewing[] = viewings
      .sort(
        (a: any, b: any) =>
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
      )
      .slice(0, 5)
      .map((v: any) => ({
        ...v,
        propertyTitle: v.propertyTitle || 'Unknown Property',
        customerName: v.customerName || 'Unknown Customer',
        customerEmail: v.customerEmail || '',
        customerPhone: v.customerPhone || '',
        date: v.date || new Date().toISOString(),
        time: v.time || '00:00',
        preferredContact: v.preferredContact || 'email',
        status: v.status || 'pending',
        isConfirmed: v.isConfirmed || false,
        scheduledAt: v.scheduledAt || v.$createdAt,
      }))

    // Get top performing properties
    const topPerformingProperties: AnalyticsProperty[] = propertyPerformance
      .sort((a, b) => b.views - a.views)
      .slice(0, 3)
      .map((perf) => {
        const originalProperty = properties.find(
          (p: any) => p.$id === perf.propertyId
        )
        return {
          ...originalProperty,
          $id: perf.propertyId,
          $collectionId: originalProperty?.$collectionId || '',
          $databaseId: originalProperty?.$databaseId || '',
          $createdAt: originalProperty?.$createdAt || new Date().toISOString(),
          $updatedAt: originalProperty?.$updatedAt || new Date().toISOString(),
          $permissions: originalProperty?.$permissions || [],
          agentId: originalProperty?.agentId || '',
          propertyId: originalProperty?.propertyId || perf.propertyId,
          agentName: originalProperty?.agentName || '',
          title: perf.title,
          description: originalProperty?.description || '',
          propertyType: originalProperty?.propertyType || 'house',
          status: perf.status as any,
          price: perf.price,
          priceUnit: originalProperty?.priceUnit || 'total',
          originalPrice: originalProperty?.originalPrice,
          priceHistory: originalProperty?.priceHistory || [],
          address: originalProperty?.address || '',
          phone: originalProperty?.phone || '',
          city: originalProperty?.city || '',
          state: originalProperty?.state || '',
          zipCode: originalProperty?.zipCode || '',
          country: originalProperty?.country || '',
          neighborhood: originalProperty?.neighborhood,
          latitude: originalProperty?.latitude || 0,
          longitude: originalProperty?.longitude || 0,
          bedrooms: originalProperty?.bedrooms || 0,
          bathrooms: originalProperty?.bathrooms || 0,
          squareFeet: originalProperty?.squareFeet || 0,
          lotSize: originalProperty?.lotSize,
          yearBuilt: originalProperty?.yearBuilt,
          features: originalProperty?.features || [],
          amenities: originalProperty?.amenities || [],
          images: originalProperty?.images || [],
          videos: originalProperty?.videos || [],
          ownerId: originalProperty?.ownerId || '',
          listedBy: originalProperty?.listedBy || 'agent',
          listDate: originalProperty?.listDate || originalProperty?.$createdAt,
          lastUpdated:
            originalProperty?.lastUpdated || originalProperty?.$updatedAt,
          isActive:
            originalProperty?.isActive !== undefined
              ? originalProperty.isActive
              : true,
          isFeatured: originalProperty?.isFeatured || false,
          isVerified: originalProperty?.isVerified || false,
          tags: originalProperty?.tags || [],
          views: perf.views,
          favorites: perf.favorites,
          paymentOutright: originalProperty?.paymentOutright || 'false',
          outright: originalProperty?.outright || false,
          paymentPlan: originalProperty?.paymentPlan || false,
          mortgageEligible: originalProperty?.mortgageEligible || false,
          customPlanAvailable: originalProperty?.customPlanAvailable || false,
          customPlanDepositPercent:
            originalProperty?.customPlanDepositPercent || 0,
          customPlanMonths: originalProperty?.customPlanMonths || 0,
          // Analytics-specific properties
          leads: perf.leads,
          conversionRate: perf.conversionRate,
        } as AnalyticsProperty
      })

    return {
      overview: {
        totalViews,
        totalLeads,
        conversionRate: Math.round(conversionRate * 10) / 10,
        avgResponseTime: '1.8h',
        totalRevenue: properties.reduce((sum: number, prop: any) => {
          if (prop.status === 'sold' || prop.status === 'rented') {
            return sum + prop.price * 0.03 // Assuming 3% commission
          }
          return sum
        }, 0),
        activeListings,
        pendingViewings,
        confirmedViewings,
      },
      propertyPerformance,
      leadSources,
      recentViewings,
      topPerformingProperties: topPerformingProperties as Property[], // Cast to original type
      timelineData,
      performanceTrends,
    }
  }

  const generateTimelineData = (
    viewings: any[],
    messages: any[],
    range: '7d' | '30d' | '90d'
  ): TimelineDataPoint[] => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const data: TimelineDataPoint[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayViewings = viewings.filter(
        (v: any) => v.date && v.date.startsWith(dateStr)
      ).length

      const dayLeads = messages.filter(
        (m: any) => m.$createdAt && m.$createdAt.startsWith(dateStr)
      ).length

      data.push({
        date: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        viewings: dayViewings,
        leads: dayLeads,
      })
    }

    return data
  }

  const generatePerformanceTrends = (
    properties: any[],
    viewings: any[],
    range: '7d' | '30d' | '90d'
  ): Record<string, number> => {
    // Group properties by status for trend analysis
    const statusCounts = {
      'for-sale': properties.filter((p: any) => p.status === 'for-sale').length,
      'for-rent': properties.filter((p: any) => p.status === 'for-rent').length,
      sold: properties.filter((p: any) => p.status === 'sold').length,
      rented: properties.filter((p: any) => p.status === 'rented').length,
    }

    return statusCounts
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAnalyticsData()
  }

  const MetricCard = ({
    title,
    value,
    icon: Icon,
    trend,
    change,
    description,
    color = 'blue',
  }: {
    title: string
    value: string | number
    icon: any
    trend?: 'up' | 'down' | 'neutral'
    change?: string
    description?: string
    color?: 'blue' | 'green' | 'purple' | 'orange'
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600',
    }

    const trendColors = {
      up: 'text-green-600',
      down: 'text-red-600',
      neutral: 'text-gray-600',
    }

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          {trend && change && (
            <div
              className={`flex items-center text-sm font-medium ${trendColors[trend]}`}
            >
              {trend !== 'neutral' && (
                <TrendingUp
                  className={`w-4 h-4 mr-1 ${
                    trend === 'down' ? 'rotate-180' : ''
                  }`}
                />
              )}
              {change}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{value}</h3>
            <p className="text-sm font-medium text-gray-900">{title}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-2">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-emerald-50`}>
            <Icon className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
      </div>
    )
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((pld: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: pld.color }}>
              {pld.name}: {pld.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="p-6 mx-auto max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 mx-auto max-w-7xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">
                Error Loading Analytics
              </h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="p-6 mx-auto max-w-7xl">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Analytics Data
          </h3>
          <p className="text-gray-500">
            Analytics data will appear once you have properties and leads.
          </p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Data
          </button>
        </div>
      </div>
    )
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  return (
    <div className="p-4 md:p-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Property Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time performance tracking and insights
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Views"
          value={analyticsData.overview.totalViews.toLocaleString()}
          icon={Eye}
          trend="up"
          change="+12%"
          description="Across all properties"
          color="blue"
        />
        <MetricCard
          title="Active Leads"
          value={analyticsData.overview.totalLeads}
          icon={Users}
          trend="up"
          change="+8%"
          description="New inquiries"
          color="green"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${analyticsData.overview.conversionRate}%`}
          icon={TrendingUp}
          trend="up"
          change="+2%"
          description="Lead to viewing ratio"
          color="purple"
        />
        <MetricCard
          title="Active Listings"
          value={analyticsData.overview.activeListings}
          icon={Home}
          trend="neutral"
          description="Currently listed"
          color="orange"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Timeline Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Performance Timeline
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Last {timeRange}</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analyticsData.timelineData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                  name="Leads"
                />
                <Area
                  type="monotone"
                  dataKey="viewings"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                  name="Viewings"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Lead Sources
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.leadSources}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => {
                    const { source, percentage } = props as LeadSourceItem
                    return `${source}: ${percentage}%`
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.leadSources.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Property Performance Bar Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Property Performance Comparison
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span>Top 5 Properties</span>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={analyticsData.propertyPerformance.slice(0, 5)}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="title"
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="views"
                name="Views"
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="leads"
                name="Leads"
                fill="#82ca9d"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="favorites"
                name="Favorites"
                fill="#ffc658"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Viewings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Recent Viewings
          </h3>
          <div className="space-y-3">
            {analyticsData.recentViewings.map((viewing) => (
              <div
                key={viewing.$id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {viewing.customerName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(viewing.date).toLocaleDateString()} at{' '}
                    {viewing.time}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    viewing.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : viewing.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {viewing.status}
                </div>
              </div>
            ))}
            {analyticsData.recentViewings.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">
                No recent viewings scheduled
              </p>
            )}
          </div>
        </div>

        {/* Top Performing Properties */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Top Performing Properties
          </h3>
          <div className="space-y-4">
            {analyticsData.topPerformingProperties.map((property, index) => {
              // Cast to AnalyticsProperty to access analytics-specific properties
              const analyticsProp = property as AnalyticsProperty
              return (
                <div
                  key={property.$id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {property.title}
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500">
                          {property.views.toLocaleString()} views
                        </span>
                        <span className="text-xs text-gray-500">
                          {analyticsProp.leads || 0} leads
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {analyticsProp.conversionRate !== undefined && (
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          analyticsProp.conversionRate >= 5
                            ? 'bg-green-100 text-green-800'
                            : analyticsProp.conversionRate >= 2
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {analyticsProp.conversionRate.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

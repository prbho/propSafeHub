//components/agents/DashboardAgentSidebar.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  BarChart3,
  Building,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  MessageSquare,
  Settings,
  Shield,
  UserCircle2,
  Users,
} from 'lucide-react'

import AgentDashboardSidebarSkeleton from './AgentDashboardSidebarSkeleton'

interface SidebarItem {
  name: string
  href: string
  icon: React.ReactNode
  badge?: number
  adminOnly?: boolean
  agentOnly?: boolean
}

interface AgentDashboardSidebarProps {
  loading?: boolean
}

interface NotificationCounts {
  total: number
  unread: number
  byType: {
    message: number
    favorite: number
    property_view: number
    viewing_request: number
    system: number
  }
}

export default function AgentDashboardSidebar({
  loading = false,
}: AgentDashboardSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, isLoading: authLoading } = useAuth()
  const [isCheckingRole, setIsCheckingRole] = useState(true)
  const [notificationCounts, setNotificationCounts] =
    useState<NotificationCounts>({
      total: 0,
      unread: 0,
      byType: {
        message: 0,
        favorite: 0,
        property_view: 0,
        viewing_request: 0,
        system: 0,
      },
    })
  const [countsLoading, setCountsLoading] = useState(true)

  // Fetch notification counts from backend
  const fetchNotificationCounts = async () => {
    if (!user?.$id) return

    try {
      setCountsLoading(true)

      const response = await fetch(
        `/api/notifications/count?userId=${user.$id}`
      )
      if (response.ok) {
        const data = await response.json()
        setNotificationCounts(data)
      }
    } catch (error) {
      console.error('Error fetching notification counts:', error)
    } finally {
      setCountsLoading(false)
    }
  }

  // Simulate role checking delay to prevent flash of wrong content
  useEffect(() => {
    if (!authLoading && user) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsCheckingRole(false)
        fetchNotificationCounts()
      }, 300)
      return () => clearTimeout(timer)
    } else if (!authLoading && !user) {
      // Use setTimeout to avoid synchronous state update
      const timer = setTimeout(() => {
        setIsCheckingRole(false)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [authLoading, user])

  const isAdmin = user?.userType === 'admin'

  const sidebarItems: SidebarItem[] = [
    {
      name: 'Dashboard',
      href: isAdmin ? '/admin/dashboard' : '/agent/dashboard',
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: 'Analytics',
      href: isAdmin ? '/admin/analytics' : '/agent/analytics',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      name: 'Viewing Requests',
      href: '/agent/dashboard/viewings',
      icon: <Calendar className="w-5 h-5" />,
      badge: notificationCounts.byType.viewing_request,
      agentOnly: true,
    },
    {
      name: 'Approval Queue',
      href: '/admin/approvals',
      icon: <CheckCircle className="w-5 h-5" />,
      badge: notificationCounts.byType.system, // Using system notifications for admin approvals
      adminOnly: true,
    },
    {
      name: 'Users Management',
      href: '/admin/users',
      icon: <UserCircle2 className="w-5 h-5" />,
      adminOnly: true,
    },
    {
      name: 'Properties',
      href: isAdmin ? '/admin/properties' : '/agent/properties',
      icon: <Building className="w-5 h-5" />,
    },
    {
      name: 'Leads',
      href: '/agent/leads',
      icon: <Users className="w-5 h-5" />,
      agentOnly: true,
    },
    {
      name: 'Messages',
      href: '/agent/messages',
      icon: <MessageSquare className="w-5 h-5" />,
      badge: notificationCounts.byType.message,
      agentOnly: true,
    },
    {
      name: 'Reports',
      href: isAdmin ? '/admin/reports' : '/agent/reports',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      name: 'Settings',
      href: isAdmin ? '/admin/settings' : '/agent/settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ]

  // Filter sidebar items based on user role
  const filteredSidebarItems = sidebarItems.filter((item) => {
    if (isAdmin) {
      return !item.agentOnly
    } else {
      return !item.adminOnly
    }
  })

  const isActive = (href: string) => {
    if (href === '/agent/dashboard' || href === '/admin/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  // Only show badge if count > 0 and not loading
  const shouldShowBadge = (item: SidebarItem) => {
    if (countsLoading) return false
    return item.badge !== undefined && item.badge > 0
  }

  // Show loading state while checking user role or during initial load
  if (loading || authLoading || isCheckingRole) {
    return <AgentDashboardSidebarSkeleton isCollapsed={isCollapsed} />
  }

  return (
    <div
      className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isAdmin ? 'bg-purple-600' : 'bg-emerald-600'
              }`}
            >
              {isAdmin ? (
                <Shield className="w-5 h-5 text-white" />
              ) : (
                <UserCircle2 className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <span className="font-bold text-lg text-gray-900 block">
                {isAdmin ? 'Admin Panel' : 'Agent Pro v1.0'}
              </span>
              {!isCollapsed && (
                <span className="text-xs text-gray-500 block">
                  {isAdmin ? 'System Administrator' : 'Premium Agent'}
                </span>
              )}
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2 space-y-2">
        {filteredSidebarItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative ${
              isActive(item.href)
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            } ${item.adminOnly ? 'border-l-2 border-purple-500' : ''} ${
              item.agentOnly ? 'border-l-2 border-emerald-500' : ''
            }`}
          >
            <div
              className={`shrink-0 ${
                isActive(item.href)
                  ? 'text-blue-700'
                  : item.adminOnly
                    ? 'text-purple-500'
                    : item.agentOnly
                      ? 'text-emerald-500'
                      : 'text-gray-500'
              }`}
            >
              {item.icon}
            </div>

            {!isCollapsed && (
              <>
                <span className="font-medium">{item.name}</span>
                {shouldShowBadge(item) && (
                  <span
                    className={`ml-auto text-xs rounded-full px-2 py-1 min-w-5 h-5 flex items-center justify-center ${
                      item.adminOnly
                        ? 'bg-purple-500 text-white'
                        : item.agentOnly
                          ? 'bg-emerald-500 text-white'
                          : 'bg-red-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.adminOnly && !shouldShowBadge(item) && (
                  <Shield className="w-3 h-3 text-purple-500 ml-auto" />
                )}
                {item.agentOnly && !shouldShowBadge(item) && (
                  <UserCircle2 className="w-3 h-3 text-emerald-500 ml-auto" />
                )}
              </>
            )}

            {/* Tooltip for collapsed state */}
            {isCollapsed && shouldShowBadge(item) && (
              <span
                className={`absolute left-10 top-1/2 -translate-y-1/2 text-xs rounded-full px-2 py-1 min-w-5 h-5 flex items-center justify-center z-50 opacity-0 group-hover:opacity-100 transition-opacity ${
                  item.adminOnly
                    ? 'bg-purple-500 text-white'
                    : item.agentOnly
                      ? 'bg-emerald-500 text-white'
                      : 'bg-red-500 text-white'
                }`}
              >
                {item.badge}
              </span>
            )}

            {isCollapsed && (
              <div className="absolute left-12 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                {item.name}
                {item.adminOnly && ' (Admin)'}
                {item.agentOnly && ' (Agent)'}
                {shouldShowBadge(item) && ` (${item.badge})`}
              </div>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer/User Info */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isAdmin
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              {isAdmin ? (
                <Shield className="w-4 h-4" />
              ) : (
                <UserCircle2 className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || (isAdmin ? 'Administrator' : 'Agent')}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {isAdmin ? 'System Administrator' : 'Premium Agent'}
              </p>
            </div>
            {/* Total notifications badge */}
            {notificationCounts.unread > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-5 h-5 flex items-center justify-center">
                {notificationCounts.unread}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// components/dashboard/DashboardSidebar.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Eye,
  Heart,
  Home,
  MessageSquare,
  // Settings,
  Shield,
  TrendingUp,
  User,
  Users,
} from 'lucide-react'

interface SidebarItem {
  name: string
  href: string
  icon: React.ReactNode
  badge?: number
  userTypes: ('admin' | 'agent' | 'seller' | 'buyer')[]
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

interface DashboardSidebarProps {
  loading?: boolean
  onCollapseChange?: (collapsed: boolean) => void
}

// Mobile toggle button component - moved outside
const MobileToggleButton = ({
  isMobileOpen,
  setIsMobileOpen,
}: {
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
}) => (
  <button
    onClick={() => setIsMobileOpen(!isMobileOpen)}
    className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-gray-200"
    aria-label={isMobileOpen ? 'Close sidebar' : 'Open sidebar'}
  >
    <ChevronRight
      className={`w-5 h-5 transition-transform ${isMobileOpen ? 'rotate-180' : ''}`}
    />
  </button>
)

// Sidebar content component - moved outside
const SidebarContent = ({
  isCollapsed,
  user,
  filteredSidebarItems,
  isActive,
  getUserTypeColor,
  getUserTypeIcon,
  getUserTypeLabel,
  handleCollapse,
  notificationCounts,
  router,
}: {
  isCollapsed: boolean
  user: any
  filteredSidebarItems: SidebarItem[]
  isActive: (href: string) => boolean
  getUserTypeColor: () => string
  getUserTypeIcon: () => React.ReactNode
  getUserTypeLabel: () => string
  handleCollapse: () => void
  notificationCounts: NotificationCounts
  router: any
}) => (
  <>
    {/* Header */}
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      {!isCollapsed && (
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${getUserTypeColor()}`}
          >
            {getUserTypeIcon()}
          </div>
          <div>
            <span className="font-bold text-lg text-gray-900 block">
              Dashboard
            </span>
            <span className="text-xs text-gray-500 block">
              {getUserTypeLabel()}
            </span>
          </div>
        </div>
      )}
      <button
        onClick={handleCollapse}
        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>
    </div>

    {/* Navigation Items */}
    <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
      {filteredSidebarItems.map((item) => (
        <Link
          key={`${item.name}-${item.href}`}
          href={item.href}
          className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative ${
            isActive(item.href)
              ? 'bg-emerald-50 text-emerald-700 font-medium'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <div
            className={`shrink-0 ${
              isActive(item.href)
                ? 'text-emerald-600'
                : 'text-gray-500 group-hover:text-gray-700'
            }`}
          >
            {item.icon}
          </div>

          {!isCollapsed && (
            <>
              <span className="font-medium flex-1 truncate">{item.name}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-5 h-5 flex items-center justify-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </>
          )}

          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-12 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-lg">
              {item.name}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
          )}
        </Link>
      ))}
    </nav>

    {/* Footer/User Info */}
    {!isCollapsed && (
      <Link href={`/settings`} className="hover:bg-gray-50 cursor-pointer">
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${getUserTypeColor()}`}
            >
              {getUserTypeIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || ''}
              </p>
            </div>
            {/* Total notifications badge */}
            {notificationCounts.unread > 0 && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/notifications')
                }}
                className="relative"
              >
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-5 h-5 flex items-center justify-center">
                  {notificationCounts.unread > 99
                    ? '99+'
                    : notificationCounts.unread}
                </span>
              </button>
            )}
          </div>
        </div>
      </Link>
    )}
  </>
)

export default function DashboardSidebar({
  loading = false,
  onCollapseChange,
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { user, isLoading: authLoading } = useAuth()
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

  // Handle sidebar collapse
  const handleCollapse = () => {
    const newCollapsedState = !isCollapsed
    setIsCollapsed(newCollapsedState)
    onCollapseChange?.(newCollapsedState)
  }

  // Close mobile sidebar on route change using an event-based approach
  useEffect(() => {
    const handleRouteChange = () => {
      // Use requestAnimationFrame to avoid synchronous setState
      requestAnimationFrame(() => {
        setIsMobileOpen(false)
      })
    }

    // Listen for Next.js route change events
    window.addEventListener('popstate', handleRouteChange)

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [])

  // Also close mobile sidebar when pathname changes
  useEffect(() => {
    // Use setTimeout to avoid synchronous setState
    const timer = setTimeout(() => {
      setIsMobileOpen(false)
    }, 0)

    return () => clearTimeout(timer)
  }, [pathname])

  // Fetch notification counts when user changes
  useEffect(() => {
    const fetchNotificationCounts = async () => {
      if (!user?.$id) return

      try {
        const response = await fetch(
          `/api/notifications/count?userId=${user.$id}`
        )
        if (response.ok) {
          const data = await response.json()
          setNotificationCounts(data)
        }
      } catch (error) {
        console.error('Error fetching notification counts:', error)
      }
    }

    // Use requestAnimationFrame to defer the state update
    const requestId = requestAnimationFrame(() => {
      fetchNotificationCounts()
    })

    return () => cancelAnimationFrame(requestId)
  }, [user])

  // All sidebar items with user type permissions
  const allSidebarItems: SidebarItem[] = [
    // Dashboard Home
    {
      name: 'Dashboard',
      href: `/dashboard/${user?.userType || 'buyer'}/${user?.$id || ''}`,
      icon: <Home className="w-5 h-5" />,
      userTypes: ['admin', 'agent', 'seller', 'buyer'],
    },

    // Admin specific
    {
      name: 'Admin Panel',
      href: `/dashboard/${user?.userType}/${user?.$id || ''}`,
      icon: <Shield className="w-5 h-5" />,
      userTypes: ['admin'],
    },
    {
      name: 'Users Management',
      href: `/dashboard/${user?.userType}/${user?.$id || ''}/users`,
      icon: <Users className="w-5 h-5" />,
      userTypes: ['admin'],
    },
    {
      name: 'Approval Queue',
      href: `/dashboard/${user?.userType}/${user?.$id || ''}/approvals`,
      icon: <Bell className="w-5 h-5" />,
      badge: notificationCounts.byType.system,
      userTypes: ['admin'],
    },

    // Agent specific
    {
      name: 'My Properties',
      href: `/dashboard/agent/${user?.$id || ''}/properties`,
      icon: <Building2 className="w-5 h-5" />,
      userTypes: ['agent'],
    },
    {
      name: 'Viewing Requests',
      href: `/dashboard/agent/${user?.$id || ''}/viewings`,
      icon: <Calendar className="w-5 h-5" />,
      badge: notificationCounts.byType.viewing_request,
      userTypes: ['agent'],
    },
    {
      name: 'Leads',
      href: `/dashboard/agent/${user?.$id || ''}/leads`,
      icon: <Users className="w-5 h-5" />,
      userTypes: ['agent'],
    },
    {
      name: 'Analytics',
      href: `/dashboard/agent/${user?.$id || ''}/analytics`,
      icon: <BarChart3 className="w-5 h-5" />,
      userTypes: ['agent'],
    },

    // Seller specific
    {
      name: 'My Listings',
      href: `/dashboard/${user?.userType}/${user?.$id || ''}/properties`,
      icon: <Home className="w-5 h-5" />,
      userTypes: ['seller'],
    },
    {
      name: 'New Listing',
      href: `/list-property`,
      icon: <DollarSign className="w-5 h-5" />,
      userTypes: ['seller'],
    },
    {
      name: 'Inquiries',
      href: `/dashboard/${user?.userType}/${user?.$id || ''}/messages`,
      icon: <MessageSquare className="w-5 h-5" />,
      badge: notificationCounts.byType.message,
      userTypes: ['seller'],
    },
    {
      name: 'Market Analysis',
      href: `/dashboard/${user?.userType}/${user?.$id || ''}/analytics`,
      icon: <TrendingUp className="w-5 h-5" />,
      userTypes: ['seller'],
    },

    // Buyer specific
    {
      name: 'Saved Properties',
      href: `/dashboard/${user?.userType}/${user?.$id || ''}/favorites`,
      icon: <Heart className="w-5 h-5" />,
      badge: notificationCounts.byType.favorite,
      userTypes: ['buyer'],
    },
    // {
    //   name: 'Scheduled Tours',
    //   href: `/dashboard/${user?.userType}/${user?.$id || ''}/tours`,
    //   icon: <Calendar className="w-5 h-5" />,
    //   userTypes: ['buyer'],
    // },
    // {
    //   name: 'Saved Searches',
    //   href: `/dashboard/${user?.userType}/${user?.$id || ''}/searches`,
    //   icon: <Search className="w-5 h-5" />,
    //   userTypes: ['buyer'],
    // },
    {
      name: 'Recently Viewed',
      href: `/dashboard/${user?.userType}/${user?.$id || ''}/viewed`,
      icon: <Eye className="w-5 h-5" />,
      userTypes: ['buyer'],
    },
    {
      name: 'Market Trends',
      href: `/dashboard/${user?.userType}/${user?.$id || ''}/trends`,
      icon: <TrendingUp className="w-5 h-5" />,
      userTypes: ['buyer'],
    },

    // Common items for all user types
    {
      name: 'Messages',
      href: `/dashboard/${user?.userType}/${user?.$id || ''}/messages`,
      icon: <MessageSquare className="w-5 h-5" />,
      badge: notificationCounts.byType.message,
      userTypes: ['admin', 'agent', 'seller', 'buyer'],
    },

    // {
    //   name: 'Settings',
    //   href: `/dashboard/${user?.userType}/${user?.$id || ''}/settings`,
    //   icon: <Settings className="w-5 h-5" />,
    //   userTypes: ['admin', 'agent', 'seller', 'buyer'],
    // },
  ]

  // Filter sidebar items based on user type
  const filteredSidebarItems = allSidebarItems.filter((item) =>
    item.userTypes.includes(user?.userType as any)
  )

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href || pathname.startsWith('/dashboard/')
    }
    return pathname === href || pathname.startsWith(href)
  }

  const getUserTypeColor = () => {
    switch (user?.userType) {
      case 'admin':
        return 'bg-purple-100 text-purple-600'
      case 'agent':
        return 'bg-blue-100 text-blue-600'
      case 'seller':
        return 'bg-amber-100 text-amber-600'
      case 'buyer':
        return 'bg-emerald-100 text-emerald-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getUserTypeIcon = () => {
    switch (user?.userType) {
      case 'admin':
        return <Shield className="w-4 h-4" />
      case 'agent':
        return <Briefcase className="w-4 h-4" />
      case 'seller':
        return <DollarSign className="w-4 h-4" />
      case 'buyer':
        return <Home className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getUserTypeLabel = () => {
    switch (user?.userType) {
      case 'admin':
        return 'Administrator'
      case 'agent':
        return 'Real Estate Agent'
      case 'seller':
        return 'Property Seller'
      case 'buyer':
        return 'Property Buyer'
      default:
        return 'User'
    }
  }

  if (loading || authLoading) {
    return (
      <div className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
        <div className="animate-pulse space-y-4 p-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <MobileToggleButton
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 
          flex flex-col z-40 transition-all duration-300
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <SidebarContent
          isCollapsed={isCollapsed}
          user={user}
          filteredSidebarItems={filteredSidebarItems}
          isActive={isActive}
          getUserTypeColor={getUserTypeColor}
          getUserTypeIcon={getUserTypeIcon}
          getUserTypeLabel={getUserTypeLabel}
          handleCollapse={handleCollapse}
          notificationCounts={notificationCounts}
          router={router}
        />
      </aside>
    </>
  )
}

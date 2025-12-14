// components/Header/UserDropdown.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import {
  Building2,
  Calculator,
  Heart,
  HomeIcon,
  Loader2,
  LogOut,
  PlusIcon,
  Settings,
  Shield,
  User,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import NotificationBell from '../NotificationBell'

export default function UserDropdown() {
  const { user, logout, isLoading: authLoading } = useAuth()
  const [isCheckingRole, setIsCheckingRole] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  // Simulate role checking delay to prevent flash of wrong content
  useEffect(() => {
    if (!authLoading && user) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsCheckingRole(false)
      }, 200)
      return () => clearTimeout(timer)
    } else if (!authLoading && !user) {
      // Use setTimeout to avoid synchronous state update
      const timer = setTimeout(() => {
        setIsCheckingRole(false)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [authLoading, user])

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Determine dashboard link based on user type - UPDATED for dynamic URLs
  const getDashboardLink = () => {
    if (!user?.$id || !user?.userType) return '/dashboard'

    // Use the dynamic URL pattern: /dashboard/[userType]/[id]
    return `/dashboard/${user.userType}/${user.$id}`
  }

  // Get dashboard icon based on user type
  const getDashboardIcon = () => {
    if (!user) return <HomeIcon className="h-4 w-4 mr-2" />

    switch (user.userType) {
      case 'admin':
        return <Shield className="h-4 w-4 mr-2" />
      case 'agent':
        return <Building2 className="h-4 w-4 mr-2" />
      case 'seller':
        return <HomeIcon className="h-4 w-4 mr-2" />
      case 'buyer':
        return <HomeIcon className="h-4 w-4 mr-2" />
      default:
        return <HomeIcon className="h-4 w-4 mr-2" />
    }
  }

  // Get dashboard label based on user type
  const getDashboardLabel = () => {
    if (!user) return 'Dashboard'

    switch (user.userType) {
      case 'admin':
        return 'Admin Dashboard'
      case 'agent':
        return 'Agent Dashboard'
      case 'seller':
        return 'Seller Dashboard'
      case 'buyer':
        return 'Buyer Dashboard'
      default:
        return 'Dashboard'
    }
  }

  // Get profile link based on user type - UPDATED for dynamic URLs
  const getProfileLink = () => {
    if (!user?.$id || !user?.userType) return '/profile'

    // Use the dynamic URL pattern: /profile/[userType]/[id]
    return `/profile/${user.userType}/${user.$id}`
  }

  // Get list property link based on user type
  const getListPropertyLink = () => {
    if (user?.userType === 'agent') {
      return '/properties/post' // Agents use the advanced property posting
    } else if (user?.userType === 'seller') {
      return '/list-property' // Regular sellers use simple listing
    }
    return '/list-property' // Fallback
  }

  // Show loading state while checking user role
  if (authLoading || isCheckingRole) {
    return (
      <div className="flex items-center space-x-4">
        {/* Show "List Property" skeleton for sellers and agents (not admin) */}
        <div className="hidden sm:block">
          <Button variant="outline" disabled className="opacity-50">
            <PlusIcon className="w-10 h-10" />
          </Button>
        </div>

        <NotificationBell />

        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full"
              disabled
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gray-200 animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Loading menu items */}
            {[...Array(5)].map((_, i) => (
              <DropdownMenuItem key={i} disabled>
                <div className="flex items-center w-full">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse mr-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <NotificationBell />

      {/* Show "List Property" for sellers and agents, hide for buyers and admin */}
      {(user?.userType === 'seller' || user?.userType === 'agent') && (
        <Button variant="outline" asChild>
          <Link href={getListPropertyLink()} aria-label="List Property">
            <PlusIcon className="w-10 font-bold h-10" />
          </Link>
        </Button>
      )}

      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-emerald-100 text-emerald-600 text-sm">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-xs leading-none text-gray-500">
                {user?.email}
              </p>
              <div className="flex items-center justify-between">
                {user?.userType && (
                  <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full mt-1">
                    {user.userType === 'admin' && (
                      <Shield className="h-3 w-3" />
                    )}
                    {user.userType === 'agent' && (
                      <Building2 className="h-3 w-3" />
                    )}
                    {user.userType === 'seller' && <User className="h-3 w-3" />}
                    {user.userType === 'buyer' && <Heart className="h-3 w-3" />}
                    {user.userType.charAt(0).toUpperCase() +
                      user.userType.slice(1)}
                  </span>
                )}
                {!user?.emailVerified && (
                  <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                    <Shield className="h-3 w-3" />
                    <span>Verify email</span>
                  </div>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Profile - UPDATED for dynamic URL */}
          <DropdownMenuItem asChild onClick={() => setIsOpen(false)}>
            <Link href={getProfileLink()} className="cursor-pointer">
              <User className="h-4 w-4 mr-2" />
              My Profile
            </Link>
          </DropdownMenuItem>

          {/* Dashboard - Dynamic based on user type - UPDATED for dynamic URL */}
          <DropdownMenuItem asChild onClick={() => setIsOpen(false)}>
            <Link href={getDashboardLink()} className="cursor-pointer">
              {getDashboardIcon()}
              {getDashboardLabel()}
            </Link>
          </DropdownMenuItem>

          {/* User Type Specific Links */}
          {user?.userType === 'agent' && (
            <>
              {/* Agent properties - Updated for dynamic URL if needed */}
              <DropdownMenuItem asChild onClick={() => setIsOpen(false)}>
                <Link
                  href={`/dashboard/agent/${user?.$id || ''}/properties`}
                  className="cursor-pointer"
                >
                  <HomeIcon className="h-4 w-4 mr-2" />
                  My Properties
                </Link>
              </DropdownMenuItem>
              {/* Agent leads - Updated for dynamic URL if needed */}
              <DropdownMenuItem asChild onClick={() => setIsOpen(false)}>
                <Link
                  href={`/dashboard/agent/${user?.$id || ''}/leads`}
                  className="cursor-pointer"
                >
                  <User className="h-4 w-4 mr-2" />
                  My Leads
                </Link>
              </DropdownMenuItem>
            </>
          )}

          {/* Admin specific links */}
          {user?.userType === 'admin' && (
            <>
              {/* Admin user management */}
              <DropdownMenuItem asChild onClick={() => setIsOpen(false)}>
                <Link
                  href={`/dashboard/admin/${user?.$id || ''}/users`}
                  className="cursor-pointer"
                >
                  <User className="h-4 w-4 mr-2" />
                  User Management
                </Link>
              </DropdownMenuItem>
              {/* Admin approvals */}
              <DropdownMenuItem asChild onClick={() => setIsOpen(false)}>
                <Link
                  href={`/dashboard/admin/${user?.$id || ''}/approvals`}
                  className="cursor-pointer"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Approval Queue
                </Link>
              </DropdownMenuItem>
              {/* Admin property management */}
              <DropdownMenuItem asChild onClick={() => setIsOpen(false)}>
                <Link
                  href={`/dashboard/admin/${user?.$id || ''}/properties`}
                  className="cursor-pointer"
                >
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Property Management
                </Link>
              </DropdownMenuItem>
            </>
          )}

          {/* Seller specific links */}
          {user?.userType === 'seller' && (
            <DropdownMenuItem asChild onClick={() => setIsOpen(false)}>
              <Link
                href={`/dashboard/seller/${user?.$id || ''}/properties`}
                className="cursor-pointer"
              >
                <HomeIcon className="h-4 w-4 mr-2" />
                My Listings
              </Link>
            </DropdownMenuItem>
          )}

          {/* Buyer specific links */}
          {user?.userType === 'buyer' && (
            <>
              <DropdownMenuItem asChild onClick={() => setIsOpen(false)}>
                <Link
                  href={`/dashboard/${user?.userType}/${user?.$id || ''}/saved`}
                  className="cursor-pointer"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Saved Properties
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild onClick={() => setIsOpen(false)}>
                <Link
                  href={`/dashboard/${user?.userType}/${user?.$id || ''}/searches`}
                  className="cursor-pointer"
                >
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Saved Searches
                </Link>
              </DropdownMenuItem>
            </>
          )}

          {/* Common Links for All Users */}
          <DropdownMenuItem asChild onClick={() => setIsOpen(false)}>
            <Link
              href={`/dashboard/${user?.userType}/${user?.$id || ''}/favorites`}
              className="cursor-pointer"
            >
              <Heart className="h-4 w-4 mr-2" />
              Favorites
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild onClick={() => setIsOpen(false)}>
            <Link
              href={`/dashboard/${user?.userType || ''}/${user?.$id || ''}/calculations/history`}
              className="cursor-pointer"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculation History
            </Link>
          </DropdownMenuItem>

          {/* Settings */}
          <DropdownMenuItem asChild onClick={() => setIsOpen(false)}>
            <Link href="/settings" className="cursor-pointer">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Logout */}
          <DropdownMenuItem
            onClick={() => {
              setIsOpen(false)
              handleLogout()
            }}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

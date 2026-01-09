// app/admin/users/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Query } from 'appwrite'
import {
  Calendar,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users,
  UserX,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'

import { databases } from '@/lib/appwrite'

interface User {
  $id: string
  $createdAt: string
  $updatedAt: string
  name: string
  email: string
  phone?: string
  userType: 'buyer' | 'seller' | 'agent' | 'admin'
  isVerified: boolean
  isActive: boolean
  lastLogin?: string
  propertiesCount?: number
  bio?: string
  avatar?: string
}

export default function UserManagementPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'agents' | 'users'>('agents')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.userType !== 'admin') {
        router.push('/dashboard')
        return
      }
      fetchUsers()
    }
  }, [isAuthenticated, user, router])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const databaseId =
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'propertyDB'
      const usersCollectionId =
        process.env.NEXT_PUBLIC_APPWRITE_USERS_TABLE_ID || 'users'
      const agentsCollectionId =
        process.env.NEXT_PUBLIC_APPWRITE_AGENTS_TABLE_ID || 'agents'

      // Fetch regular users (buyers, sellers, admins)
      const usersResponse = await databases.listDocuments(
        databaseId,
        usersCollectionId,
        [Query.orderDesc('$createdAt'), Query.limit(200)]
      )

      // Fetch agents from agents collection
      const agentsResponse = await databases.listDocuments(
        databaseId,
        agentsCollectionId,
        [Query.orderDesc('$createdAt'), Query.limit(200)]
      )

      console.log('Fetched regular users:', usersResponse.documents.length)
      console.log('Fetched agents:', agentsResponse.documents.length)

      // Transform regular users data
      const transformedUsers: User[] = usersResponse.documents.map(
        (doc: any) => ({
          $id: doc.$id,
          $createdAt: doc.$createdAt,
          $updatedAt: doc.$updatedAt,
          name: doc.name || 'Unknown User',
          email: doc.email || '',
          phone: doc.phone || '',
          userType: doc.userType || 'buyer',
          isVerified: doc.isVerified || false,
          isActive: doc.isActive !== undefined ? doc.isActive : true,
          lastLogin: doc.lastLogin,
          propertiesCount: doc.propertiesCount || 0,
          bio: doc.bio,
          avatar: doc.avatar,
        })
      )

      // Transform agents data and set userType to 'agent'
      const transformedAgents: User[] = agentsResponse.documents.map(
        (doc: any) => ({
          $id: doc.$id,
          $createdAt: doc.$createdAt,
          $updatedAt: doc.$updatedAt,
          name: doc.name || doc.fullName || 'Unknown Agent',
          email: doc.email || '',
          phone: doc.phone || doc.contactNumber || '',
          userType: 'agent',
          isVerified: doc.isVerified || doc.status === 'verified' || false,
          isActive:
            doc.isActive !== undefined
              ? doc.isActive
              : doc.status !== 'inactive',
          lastLogin: doc.lastLogin,
          propertiesCount: doc.propertiesCount || doc.listedProperties || 0,
          bio: doc.bio || doc.description || '',
          avatar: doc.avatar || doc.profileImage,
        })
      )

      // Combine both arrays
      const allUsers = [...transformedUsers, ...transformedAgents]
      console.log('Total users after combining:', allUsers.length)
      setUsers(allUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  // Filter users based on active tab and search
  const filteredUsers = users.filter((user) => {
    const matchesTab =
      activeTab === 'agents'
        ? user.userType === 'agent'
        : user.userType === 'buyer' || user.userType === 'seller'

    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesTab && matchesSearch
  })

  // Agent-specific actions
  const approveAgent = async (userId: string) => {
    try {
      setActionLoading(userId)
      const databaseId =
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'propertyDB'
      const agentsCollectionId =
        process.env.NEXT_PUBLIC_APPWRITE_AGENTS_TABLE_ID || 'agents'

      // Update agent in agents collection
      await databases.updateDocument(databaseId, agentsCollectionId, userId, {
        isVerified: true,
        isActive: true,
        status: 'verified', // You might have a status field in your agents collection
      })

      setUsers(
        users.map((user) =>
          user.$id === userId
            ? { ...user, isVerified: true, isActive: true }
            : user
        )
      )
      toast.success('Agent approved successfully')
    } catch (error) {
      console.error('Error approving agent:', error)
      toast.error('Failed to approve agent')
    } finally {
      setActionLoading(null)
    }
  }

  const rejectAgent = async (userId: string) => {
    try {
      setActionLoading(userId)
      const databaseId =
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'propertyDB'
      const agentsCollectionId =
        process.env.NEXT_PUBLIC_APPWRITE_AGENTS_TABLE_ID || 'agents'

      // Update agent in agents collection
      await databases.updateDocument(databaseId, agentsCollectionId, userId, {
        isActive: false,
        status: 'rejected',
      })

      setUsers(
        users.map((user) =>
          user.$id === userId ? { ...user, isActive: false } : user
        )
      )
      toast.success('Agent rejected successfully')
    } catch (error) {
      console.error('Error rejecting agent:', error)
      toast.error('Failed to reject agent')
    } finally {
      setActionLoading(null)
    }
  }

  // Delete user (both agents and regular users)
  const deleteUser = async (userId: string) => {
    const userToDelete = users.find((u) => u.$id === userId)

    toast.custom(
      (t) => (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <Trash2 className="w-3 h-3 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">
                Delete {userToDelete?.userType === 'agent' ? 'Agent' : 'User'}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Are you sure you want to delete {userToDelete?.name}? This
                action cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => toast.dismiss(t)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    toast.dismiss(t)
                    await performDelete(userId)
                  }}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        duration: 10000,
      }
    )
  }

  const performDelete = async (userId: string) => {
    const userToDelete = users.find((u) => u.$id === userId)

    try {
      setActionLoading(userId)

      const deleteToast = toast.loading(`Deleting ${userToDelete?.name}...`)

      const databaseId =
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'propertyDB'

      // Determine which collection to delete from based on user type
      const collectionId =
        userToDelete?.userType === 'agent'
          ? process.env.NEXT_PUBLIC_APPWRITE_AGENTS_TABLE_ID || 'agents'
          : process.env.NEXT_PUBLIC_APPWRITE_USERS_TABLE_ID || 'users'

      await databases.deleteDocument(databaseId, collectionId, userId)

      setUsers(users.filter((user) => user.$id !== userId))

      toast.success(`${userToDelete?.name} has been deleted successfully`, {
        id: deleteToast,
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error(`Failed to delete ${userToDelete?.name}`)
    } finally {
      setActionLoading(null)
    }
  }

  // Rest of the component remains the same...
  // Stats calculations
  const totalAgents = users.filter((u) => u.userType === 'agent').length
  const verifiedAgents = users.filter(
    (u) => u.userType === 'agent' && u.isVerified
  ).length
  const pendingAgents = users.filter(
    (u) => u.userType === 'agent' && !u.isVerified
  ).length
  const totalUsers = users.filter(
    (u) => u.userType === 'buyer' || u.userType === 'seller'
  ).length
  const buyers = users.filter((u) => u.userType === 'buyer').length
  const sellers = users.filter((u) => u.userType === 'seller').length

  const getUserTypeBadge = (userType: string) => {
    const baseStyles =
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'
    switch (userType) {
      case 'agent':
        return `${baseStyles} bg-blue-100 text-blue-800`
      case 'seller':
        return `${baseStyles} bg-green-100 text-green-800`
      case 'buyer':
        return `${baseStyles} bg-purple-100 text-purple-800`
      case 'admin':
        return `${baseStyles} bg-red-100 text-red-800`
      default:
        return `${baseStyles} bg-gray-100 text-gray-800`
    }
  }

  const getStatusBadge = (user: User) => {
    if (user.userType === 'agent') {
      if (!user.isActive) {
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <UserX className="w-3 h-3 mr-1" />
            Rejected
          </span>
        )
      }
      if (user.isVerified) {
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <UserCheck className="w-3 h-3 mr-1" />
            Verified
          </span>
        )
      }
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage agents and regular users on the platform
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Agents</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalAgents}
                </p>
                <p className="text-sm text-blue-600">
                  {verifiedAgents} verified
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Agents</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingAgents}
                </p>
                <p className="text-sm text-yellow-600">Need verification</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                <p className="text-sm text-gray-600">Buyers & Sellers</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">User Breakdown</p>
                <p className="text-lg font-bold text-gray-900">
                  {buyers} buyers
                </p>
                <p className="text-sm text-green-600">{sellers} sellers</p>
              </div>
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Tabs and Search */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { key: 'agents', label: 'Agents', count: totalAgents },
                { key: 'users', label: 'Regular Users', count: totalUsers },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`text-xs rounded-full px-2 py-1 min-w-5 h-5 flex items-center justify-center ${
                      activeTab === tab.key
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="max-w-md">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab} by name, email, or phone...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="p-6">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No {activeTab} Found
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? 'Try adjusting your search criteria'
                    : `No ${activeTab} have been registered yet.`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.$id}
                    className="bg-gray-50 rounded-lg border border-gray-200 p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* User Avatar */}
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          {user.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full"
                              unoptimized
                            />
                          ) : (
                            <Users className="w-6 h-6 text-blue-600" />
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {user.name}
                            </h3>
                            <span className={getUserTypeBadge(user.userType)}>
                              {user.userType.charAt(0).toUpperCase() +
                                user.userType.slice(1)}
                            </span>
                            {getStatusBadge(user)}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              <span>{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Joined{' '}
                                {new Date(user.$createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {user.bio && (
                            <p className="text-sm text-gray-600 mt-2">
                              {user.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {activeTab === 'agents' &&
                          !user.isVerified &&
                          user.isActive && (
                            <>
                              <button
                                onClick={() => approveAgent(user.$id)}
                                disabled={actionLoading === user.$id}
                                className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading === user.$id ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                Approve
                              </button>
                              <button
                                onClick={() => rejectAgent(user.$id)}
                                disabled={actionLoading === user.$id}
                                className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading === user.$id ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                                Reject
                              </button>
                            </>
                          )}

                        {/* Delete button for all users */}
                        <button
                          onClick={() => deleteUser(user.$id)}
                          disabled={actionLoading === user.$id}
                          className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === user.$id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

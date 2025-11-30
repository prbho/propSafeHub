// components/agents/AgentDashboardSidebarSkeleton.tsx
'use client'

interface AgentDashboardSidebarSkeletonProps {
  isCollapsed: boolean
}

export default function AgentDashboardSidebarSkeleton({
  isCollapsed,
}: AgentDashboardSidebarSkeletonProps) {
  return (
    <div
      className={`animate-pulse flex flex-col ${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-white border-r border-gray-200`}
    >
      {/* Header Skeleton */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-lg" />
            <div className="h-4 w-28 bg-gray-200 rounded" />
          </div>
        )}
        <div className="w-6 h-6 bg-gray-200 rounded" />
      </div>

      {/* Navigation Items Skeleton */}
      <nav className="flex-1 p-2 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-lg">
            <div className="w-5 h-5 bg-gray-300 rounded" />
            {!isCollapsed && <div className="h-4 w-32 bg-gray-200 rounded" />}
          </div>
        ))}
      </nav>

      {/* Footer/User Info Skeleton */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full" />
            <div className="flex-1">
              <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
              <div className="h-3 w-16 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

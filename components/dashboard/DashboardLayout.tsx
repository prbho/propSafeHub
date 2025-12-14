// components/dashboard/DashboardLayout.tsx
'use client'

import { ReactNode, useState } from 'react'

import DashboardSidebar from './DashboardSidebar'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar onCollapseChange={setSidebarCollapsed} />

        {/* Main Content */}
        <main
          className={`
          flex-1 min-h-screen transition-all duration-300
          ${sidebarCollapsed ? 'lg' : 'lg'}
        `}
        >
          <div className="">{children}</div>
        </main>
      </div>
    </div>
  )
}

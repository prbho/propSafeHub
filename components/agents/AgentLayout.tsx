'use client'

import { ReactNode } from 'react'

import AgentDashboardSidebar from './AgentDashboardSidebar'

interface AgentLayoutProps {
  children: ReactNode
}

export default function AgentLayout({ children }: AgentLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <AgentDashboardSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

// components/dashboard/QuickActions.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

interface QuickAction {
  title: string
  description: string
  icon: any
  href: string
  color: string
}

interface QuickActionsProps {
  actions: QuickAction[]
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action, index) => (
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
  )
}
